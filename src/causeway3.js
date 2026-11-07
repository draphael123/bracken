// src/causeway3.js - THE DROWNED CAUSEWAY 2: THE SEA ACT FINALE (claude/causeway3w, OPUS greybox, 2026-11-07). Data + a pure build.
// Sources: scratch/plan-water-1105.md item 10 + s2/s3/s4/s5/s6 (Daniel accepted the s6 recs 11-05 14:56); scratch/brief-causeway2-1016.md (Daniel 10-16, all recs).
// "too short and doesn't feel like the final level in the water section." -> ~1.6x long (612 -> 980 columns), THREE ACTS, THE STORM BUILDS: the tide turns every
// 30 s -> 22 s -> 15 s (the kit's per-act rate), the sky goes to dusk and then to NIGHT with told lightning, and the last act ends in a COLLAPSE CHASE to the
// lighthouse's steps. Pilgrim stone, storm night, and the lighthouse on the horizon from the first screen (src/causeway3-hands.js draws it, nearer each act).
// THE EXAM RULE (plan item 10): no new teaching and no new foe - ONE REMIX of each sea verb the act taught, all on THE WATER KIT (src/tide-kit.js, src/pull-field.js):
//   ACT I   THE PILGRIM ROAD (0-305, 30 s; the sea fills the CUTS in the road, never over it)
//           THE STONES     SLUICE  the channel's own tide is in nearly always (a 3 s dry window): turn the sluice wheel and walk the stones in its 12 s hold   (LW3's race)
//           THE COVE       BELL    the cove boat floats up level with the sea wall only at high water: the hamlet bell calls it in                       (LW3's cove)
//           THE GUN        CANNON  the pilgrims' toll tower lies across the road: one blow on the breech of a gun off the wrecks and the rubble is open    (Flotilla's gun)
//   ACT II  THE HOLY ISLAND (306-598, 22 s; the sea comes OVER the road now, and dusk)
//           THE WRECK      RIGGING a hull across the road; her shrouds hang over HIGH water only: swim up to them, climb over her yard          (Hurricane's rigging)
//           THE UNDERCROFT FLOODGATE the chapel crypt's lever floods or drains it: drained, a drowned knight walks the floor and the door is 10 rows up;
//                                  flooded, swim up to it (a kit LEVER chamber, the mark survives a death)                                    (Keep 2's floodgates)
//           THE SEA ARCH   CURRENT + AIR the tunnel under the island runs WITH the flood and AGAINST the ebb (a pull field signed by the tide): swim
//                                  it with the flood, and in the ebb hold the iron ring at an air bell until it turns                       (Deep 3 / Pirate Fleet currents)
//   ACT III THE LAST MILE (599-932, 15 s; NIGHT, lightning shows the road)
//           THE DARK MILE  LAMPS   storm lamps on the waystones: strike one twice and it burns; the last one lifts THE PILGRIMS' GATE         (Lamplit's lamps)
//           THE LAST BELL  SLUICE + BELL the exam: hold the sea out to cross the stones, then call it in to float the boat up the light's sea wall
//           THE COLLAPSE   the chase: a Kraken arm smashes the road behind you, and the sea takes it a span at a time to the lighthouse steps
//   then THE KRAKEN'S REACH: master's columns 565-611 cell for cell at 933-979 (today's Kraken fight; KRAKEN 3's raft is a later lane).
// KRAKEN FORESHADOW (brief 5): in act III arms strike the road (told: a shadow and a bulge, 1.1 s) - a hazard, not a fight; the last one smashes the road into the chase.
// FLAG: CW3_SHIPS = false. OFF, the 'causeway' row builds master's Causeway exactly (tools/causeway3.mjs hashes it). ON: ?cw3=1, globalThis.BRACKEN_CW3, or CW3=1 for Node.
// Same road slot ('causeway'), same boss id, no save moves (three silvers, one per act).
// Theme (plan s4): pilgrim stone, storm night, lightning, the lighthouse on the horizon from screen one. Timber only where it IS a ship (the wreck's hull, the boats).
// No goblins: master's tribute cairns sit in master's last mile, which is not copied; the reach is copied as it is (its own art).

export const CW3_SHIPS = false;
export function cw3On() {
  if (CW3_SHIPS) return true;
  try { if (globalThis.BRACKEN_CW3 === true || globalThis.BRACKEN_CW3 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]cw3=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.CW3 === '1') return true; } catch { /* no node */ }
  return false;
}

/* THE NUMBERS. Columns and rows are the level's own (final). */
export const CW3 = {
  W: 980, H: 44, KEEP0: 565, OFF: 368, END: 932,   /* master's columns 565-611 (the end of the last mile + THE KRAKEN'S REACH) land at 933-979 */
  R: 24, HI: 20, LO: 31,                           /* the road's top row; act II/III high water (over the road); low water */
  /* THE STORM BUILDS: one base cycle (30 s), the act's rate makes it 22 s and then 15 s. Every tell >= 1.5 s at the rate (the kit lints it). */
  cycle: { low: 9, warn: 3, rise: 3, high: 9, turn: 3, fall: 3 },
  acts: [
    { id: 'act1', name: 'ACT I: THE PILGRIM ROAD', x0: 0, x1: 305, rate: 1, hi: 24, every: 30 },     /* act I's sea fills the cuts in the road, never over it */
    { id: 'act2', name: 'ACT II: THE HOLY ISLAND', x0: 306, x1: 598, rate: 30 / 22, hi: 20, every: 22 },
    { id: 'act3', name: 'ACT III: THE LAST MILE', x0: 599, x1: 932, rate: 2, hi: 20, every: 15 },
  ],
  /* THE STONES' CHANNEL (act I): in nearly always - its own dry window is far shorter than the walk; the sluice holds it out */
  race1: { lo: 31, hi: 24, cycle: { low: 1, warn: 1.5, rise: 1.5, high: 21, turn: 3, fall: 2 }, hold: 12, x0: 104, x1: 145 },
  /* THE LAST BELL's channel: act III's rate (it turns every 15 s too) on a cycle that is in nearly always - its dry window is shorter than the walk; the sluice holds it */
  last: { lo: 31, hi: 20, cycle: { low: 2, warn: 3, rise: 3, high: 16, turn: 3, fall: 3 }, rate: 2, hold: 15, x0: 704, x1: 758 },
  crypt: { lo: 39, hi: 27, rise: 2.5, x0: 406, x1: 432 },
  arch: { x0: 433, x1: 496, y0: 27, y1: 32, strength: 70, posts: [450, 466, 482] },
  chase: { x0: 805, x1: 903, trigger: 808, speed: 50, crack: 1.2, smash: [805, 807] },
  arms: { tell: 1.1, slam: 0.5, dmg: 14, knock: 120 },
  rip: 120,
  checks: [[285, 19], [590, 19], [790, 16], [925, 17]],
  lampGate: { lamp: 690, col: 697 },
  sections: [['THE LANDING', 0, 44], ['THE MILE ROAD', 45, 103], ['THE STONES', 104, 147], ['THE COVE', 148, 205], ['THE GUN', 206, 265], ['THE WAYSTATION', 266, 305],
    ['THE WRECK', 306, 358], ['THE HOLY ISLAND', 359, 437], ['THE SEA ARCH', 438, 500], ['THE LEE', 501, 598],
    ['THE DARK MILE', 599, 703], ['THE LAST BELL', 704, 766], ['THE LIGHT\'S HOLM', 767, 804], ['THE COLLAPSE', 805, 903], ['THE LIGHTHOUSE', 904, 932], ['THE KRAKEN\'S REACH', 933, 979]],
};
export const CW3_RULE = 'THE TIDE TAKES THE ROAD. THE BELLS SAY WHEN, AND THE BELLS ARE YOURS.';
export const CW3_SIGNS = {
  intro: 'THE DROWNED CAUSEWAY. THE PILGRIMS WALKED TO THE LIGHT AT LOW WATER. A STORM IS COMING IN BEHIND YOU.',
  light: 'THE LIGHT AT THE END OF THE ROAD. EVERY BELL ON THE ROAD IS A TIDE BELL, AND EVERY ONE IS YOURS.',
  stones: 'THE STONES\' CHANNEL IS IN NEARLY ALWAYS, AND IT RUNS OUT TO SEA. TURN THE SLUICE WHEEL AND WALK THE STONES WHILE IT HOLDS.',
  cove: 'THE COVE BOAT RIDES UP TO THE SEA WALL AT HIGH WATER. THE HAMLET BELL CALLS IT IN.',
  gun: 'THE TOLL TOWER FELL ACROSS THE ROAD. A GUN OFF THE WRECKS LIES BESIDE IT, STILL LOADED.',
  storm1: 'THE STORM IS COMING IN. FROM HERE THE TIDE COMES OVER THE ROAD, AND IT TURNS FASTER.',
  wreck: 'HER SHROUDS HANG OVER HIGH WATER. WAIT FOR THE FLOOD, SWIM UP TO THEM, CLIMB HER.',
  chapel: 'THE ISLAND CHAPEL. THE DROWNED STILL COME TO IT, AND THEY SHUT THE DOORS BEHIND YOU.',
  crypt: 'THE UNDERCROFT\'S FLOODGATE. DRAINED, YOU WALK ITS FLOOR. FLOODED, YOU SWIM TO ITS DOOR.',
  arch: 'THE SEA ARCH RUNS WITH THE FLOOD AND AGAINST THE EBB. IN THE EBB, HOLD THE RING AT AN AIR BELL (HOLD UP) AND WAIT.',
  lee: 'THE LEE OF THE ISLAND. NIGHT COMES DOWN ON THE LAST MILE.',
  storm2: 'NIGHT. THE TIDE TURNS EVERY FEW BREATHS NOW. THE LIGHTNING SHOWS THE ROAD, AND SO DO THE LAMPS.',
  lamps: 'A STORM LAMP ON EVERY WAYSTONE. STRIKE ONE TWICE AND IT BURNS.',
  gate: 'THE PILGRIMS\' GATE OPENS TO A LIT LAMP.',
  last: 'THE LAST BELL. HOLD THE SEA OUT TO CROSS THE STONES. THEN CALL IT IN, AND LET THE BOAT LIFT YOU TO THE LIGHT.',
  holm: 'THE ROAD TO THE LIGHT IS OLD AND THE SEA IS UNDER IT. IT WILL NOT HOLD LONG. DO NOT STOP.',
  lighthouse: 'THE LIGHT. THE ROAD BEHIND YOU IS GONE. THE WATER AT THE END OF THIS ONE IS BREATHING.',
};

/* THE BUILD. R = master's built Causeway (theDrownedCauseway()); out = Causeway 2 (a new object; R is read, not mutated). Pure. */
export function buildCauseway3(R0, T, TS = 16) {
  const { W, H, KEEP0, OFF, R: RD } = CW3;
  const grid = new Uint8Array(W * H);
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const block = (x0, x1, y0, y1) => fill(x0, x1, y0, y1 === undefined ? H - 1 : y1, T.SOLID);
  const road = (x0, x1, top = RD) => block(x0, x1, top, H - 1);
  const air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR);
  const nets = []; const net = (x, y0, y1) => nets.push([x, y0, y1]);   /* EVERY ROPE IS HUNG LAST */
  const plat = (x, y, n) => fill(x, x + n - 1, y, y, T.ONEWAY);
  const ents = [];
  const ent = (t, x, y, o) => ents.push({ t, x, y, ...(o || {}) });
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const deco = (kind, x, y, o) => ent('deco', x, y, Object.assign({ kind }, o || {}));
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  const pools = [];
  /* a kit pool: drawn at its HIGH line as built (the reach model swims it there); the kit moves it from the first frame */
  const pool = (id, x0, x1, line, o) => pools.push(Object.assign({ id, x0: x0 * TS, x1: (x1 + 1) * TS, y: line * TS, base: 42 * TS, bottom: 40 * TS, swim: true, clear: true, wash: 0.42, grad: false, sea: true, cw3: true }, o || {}));
  const verbs = { act1: [], act2: [], act3: [], race1: [], crypt: [], last: [] };
  const bell = (tide, x, y, o) => verbs[tide].push(Object.assign({ t: 'bell', x, y }, o || {}));
  const sluice = (tide, x, y, hold) => verbs[tide].push({ t: 'sluice', x, y, hold });
  const floats = { act1: [], last: [] }, movers = [], rigBands = [];
  const boat = (tide, id, x0, x1, rest, top) => { floats[tide].push({ id, x0, x1, y: rest, top, free: 4 }); rigBands.push([x0, x1, top, rest]);
    movers.push({ kind: 'cw3boat', cw3: 'float', fid: id, tide, x: x0 * TS, x0: x0 * TS, y: rest * TS, rest: rest * TS, w: (x1 - x0 + 1) * TS, h: 8 }); };
  const props = []; const prop = (kind, x, y, o) => props.push({ kind, x, y, ...(o || {}) });   /* GREYBOX set dressing the hands draw */
  const D = { vents: [], clams: [], bulbs: [], wrecks: [], pockets: [] };
  const arms = []; const arm = (x, o) => arms.push({ x, ...(o || {}) });   /* KRAKEN FORESHADOW: told strikes on the road (src/causeway3-hands.js) */
  const lamps = [];
  const supports = [], airRooms = [];

  block(0, KEEP0 + OFF - 1, 40, H - 1);   /* the bed of the flats, under everything */

  // =====================================================================================================================
  // ACT I - THE PILGRIM ROAD (0-305). 30 s. The sea fills the cuts in the road and is level with it at high water.
  // =====================================================================================================================
  // ---- THE LANDING (0-44): the sea wall, the pilgrim stone, the first bell, and the light on the horizon ----
  block(0, 40, 18);
  ent('check', 3, 17); sign(2, 17, CW3_SIGNS.intro); sign(14, 17, CW3_SIGNS.light);
  deco('waystone', 9, 17); deco('wayShrine', 22, 17); deco('fencePosts', 34, 17);
  bell('act1', 28, 17); prop('pilgrimStone', 18, 17);
  coins([6, 16], [12, 16], [25, 16], [31, 16], [37, 16]);
  block(41, 42, 20); block(43, 44, 22);   /* the steps down off the sea wall */

  // ---- THE MILE ROAD (45-103): the road on its piers and the first dip (a cut: it floods at high water) ----
  road(45, 70); block(71, 72, 26); block(73, 86, 30); block(87, 88, 26); road(89, 103);
  net(73, 25, 29); net(86, 25, 29);   /* rungs up the dip's sides, for a hero who meets the flood in it */
  deco('waystone', 52, 23); deco('waystone', 66, 23, { v: 1 }); deco('brokenArch', 95, 23);
  foe('sailor', 62, 23); foe('petrel', 80, 16); foe('scout', 99, 23); foe('sailor', 90, 23);
  coins([75, 29], [79, 29], [83, 29], [56, 22], [92, 22]);

  // ---- THE STONES (104-147): SLUICE. The channel's own tide is in nearly always; its rip carries a swimmer back to the near bank ----
  block(98, 98, 22, 23); block(99, 101, 20, 23);   /* the sluice house's plinth (a step up onto it), over act I's high water */
  sluice('race1', 100, 19, CW3.race1.hold); sign(97, 23, CW3_SIGNS.stones);
  for (const x of [107, 112, 117, 122, 127, 132, 137]) block(x, x + 1, 28);
  block(142, 143, 28); block(144, 145, 26);   /* the last stone and the far bank's step */
  net(104, 25, 31);   /* the near bank's rungs: where the rip leaves you */
  road(146, 159);
  foe('eel', 125, 36); foe('petrel', 128, 22); foe('petrel', 140, 21);
  coins([108, 27], [118, 27], [128, 27], [138, 27], [143, 27]);
  ent('silver', 120, 37);   /* ACT I's SILVER: on the channel bed under the third stone (dive for it in the hold, or the flood) */

  // ---- THE COVE (148-205): BELL. The boat lies on the mud at low water; at high she is a hop under the sea wall ----
  bell('act1', 157, 19); block(155, 155, 22, 23); block(156, 158, 20, 23);   /* THE HAMLET BELL on its stone (a step up onto it) */
  sign(150, 23, CW3_SIGNS.cove);
  air(160, 175, 24, 31); block(160, 175, 32);   /* the cove: mud at 32 */
  net(160, 24, 31);   /* the kelp ladder back up out of the mud */
  boat('act1', 'b1', 162, 175, 31, 23);
  block(176, 200, 21);   /* THE SEA WALL: three rows over the boat's deck at high water, eleven over the mud */
  prop('cottage', 182, 20); prop('cottage', 192, 20); prop('smoke', 183, 20); prop('gulls', 188, 20);
  foe('sailor', 186, 20); foe('netter', 197, 20);
  block(201, 202, 22);
  coins([164, 30], [168, 30], [172, 30], [180, 19], [190, 19], [199, 19]);

  // ---- THE GUN (203-265): CANNON. The toll tower lies across the road; a gun off the wrecks lies beside it, still loaded ----
  road(203, 265);
  block(240, 246, 6, 23);   /* the fallen tower: 18 rows of stone across the road */
  ent('cannon', 233, 23, { hole: [240, 246, 17, 23], aim: 1 }); sign(228, 23, CW3_SIGNS.gun);
  foe('bonecorsair', 222, 23); foe('bonecorsair', 236, 23); foe('scout', 243, 5);
  deco('mastStump', 214, 23); deco('seaChest', 218, 23);
  coins([210, 22], [226, 22], [250, 22], [258, 22]);

  // ---- THE WAYSTATION (266-305): the holm over every high water, SHRINE ONE, and the storm ----
  block(266, 267, 22); block(268, 269, 20); block(270, 305, 20);   /* (the act I / act II seam is inside this rock: no water stands against water) */
  ent('check', CW3.checks[0][0], CW3.checks[0][1]); sign(276, 19, CW3_SIGNS.storm1);
  ent('brazier', 290, 19); deco('tent', 294, 19); deco('lanternPost', 300, 19); deco('waystone', 282, 19, { v: 1 });
  foe('tideguard', 259, 23); foe('netter', 272, 19);
  coins([273, 18], [287, 18], [297, 18], [303, 18]);

  // =====================================================================================================================
  // ACT II - THE HOLY ISLAND (306-598). 22 s. The sea comes over the road (4 rows) at high water. Dusk.
  // =====================================================================================================================
  // ---- THE WRECK (306-358): RIGGING. A hull across the road; her shrouds hang over HIGH water only ----
  block(306, 307, 22); road(308, 348);
  block(315, 338, 12, 23);   /* the hull: on the road, twelve rows tall */
  net(314, 11, 17);   /* HER SHROUDS: the lowest rung is three rows over high water's surface - a swimmer's leap; from the road at low water, out of reach */
  net(326, 4, 11); plat(322, 4, 9);   /* the mainmast and her yard (the act's silver at its end) */
  ent('silver', 330, 3);
  foe('bonecorsair', 320, 11); foe('cutlass', 334, 11); foe('scout', 324, 3);
  sign(309, 23, CW3_SIGNS.wreck); deco('figurehead', 339, 23);
  block(349, 351, 30); road(352, 356); block(357, 358, 22);   /* a broken span (a 3-tile gap on its pier) and the step up onto the island */
  net(349, 25, 29); net(351, 25, 29);
  foe('petrel', 350, 19);
  coins([311, 22], [318, 10], [330, 10], [336, 10], [344, 22], [354, 22]);

  // ---- THE HOLY ISLAND (359-437): THE CHAPEL (the ambush) and THE UNDERCROFT (FLOODGATE) ----
  block(359, 500, 20);   /* the island: its top is high water's line, so it stays dry */
  block(372, 404, 8, 9); block(372, 374, 10, 15); block(402, 404, 10, 15);   /* the chapel: roof, walls (doors under them, rows 16-19) */
  sign(366, 19, CW3_SIGNS.chapel); bell('act2', 388, 19, { swim: false });   /* THE CHAPEL BELL is a tide bell too (act II's) */
  deco('wayShrine', 380, 19); deco('wayShrine', 396, 19);
  coins([379, 18], [385, 18], [392, 18], [398, 18]);
  /* THE UNDERCROFT: a hole east of the chapel down into the crypt. Its lever (on the floor under the hole) floods or drains it */
  air(410, 412, 20, 26); air(406, 432, 27, 38);
  net(410, 20, 38);   /* the ladder down (and back up, drained) */
  air(418, 420, 25, 26); airRooms.push([418, 420, 25, 27]);   /* a pocket of air in its roof */
  air(433, 433, 27, 29);   /* THE DOOR: high in the east wall, ten rows over the floor - into the sea arch */
  sign(407, 19, CW3_SIGNS.crypt);
  foe('drownedknight', 426, 38); foe('eel', 420, 33);
  coins([414, 38], [422, 38], [430, 38]);
  /* THE FALLEN BELL TOWER: across the island's crown - the top road is shut, the way on is under */
  block(438, 442, 4, 19);

  // ---- THE SEA ARCH (433-500): CURRENT + AIR. Always flooded; it runs with the flood and against the ebb; three air bells with iron rings ----
  air(434, 496, 27, 32);
  for (const x of CW3.arch.posts) { air(x - 1, x + 1, 25, 26); airRooms.push([x - 1, x + 1, 25, 27]); }   /* an air bell in the roof (src/deepair.js reads L.airRooms) */
  air(494, 496, 20, 26); net(496, 20, 27);   /* the shaft up to the island's far end */
  sign(444, 19, CW3_SIGNS.arch);
  foe('eel', 458, 31); foe('eel', 474, 30);
  coins([441, 29], [457, 29], [473, 29], [489, 29]);
  foe('merrowcaller', 486, 19);   /* the island's far end: a caller over the shaft mouth */

  // ---- THE LEE (501-598): the elite holds the road; SHRINE TWO; night comes down ----
  block(501, 502, 22); road(503, 598);
  foe('cutlass', 512, 23); foe('netter', 522, 23); block(536, 536, 23, 23); foe('scout', 536, 22);
  foe('tideguard', 556, 23);   /* (the ELITE: CW3_TABLES.ELITES, his gate at 564) */
  foe('sailor', 572, 23); foe('petrel', 566, 15);
  block(582, 605, 20);   /* SHRINE TWO's holm (the act II / act III seam is inside this rock) */
  ent('check', CW3.checks[1][0], CW3.checks[1][1]); sign(586, 19, CW3_SIGNS.lee);
  deco('wayShrine', 596, 19); ent('brazier', 600, 19);
  coins([508, 22], [530, 22], [548, 22], [576, 22], [594, 18]);
  sign(603, 19, CW3_SIGNS.storm2);

  // =====================================================================================================================
  // ACT III - THE LAST MILE (599-932). 15 s. NIGHT: the lightning shows the road, and the lamps do.
  // =====================================================================================================================
  // ---- THE DARK MILE (606-703): LAMPS. Storm lamps on the waystones; the last one lifts THE PILGRIMS' GATE ----
  road(606, 640); road(644, 660); road(664, 680); road(684, 703);   /* three broken spans (3-tile gaps) */
  for (const [a, b] of [[641, 643], [661, 663], [681, 683]]) { block(a, b, 33); net(a, 25, 32); net(b, 25, 32); }
  for (const x of [618, 632, 650, 672]) { ent('lantern', x, 23, { dark: true }); lamps.push({ x, y: 23 }); }
  ent('lantern', CW3.lampGate.lamp, 23, { dark: true }); lamps.push({ x: CW3.lampGate.lamp, y: 23, gate: CW3.lampGate.col });
  for (let y = 0; y <= 23; y++) set(CW3.lampGate.col, y, T.PORT);   /* THE PILGRIMS' GATE */
  sign(610, 23, CW3_SIGNS.lamps); sign(686, 23, CW3_SIGNS.gate);
  foe('lanternshade', 626, 23); foe('scout', 657, 23); foe('cutlass', 668, 23); foe('petrel', 676, 16); foe('tideguard', 692, 23);
  arm(652); arm(675);
  coins([614, 22], [636, 22], [648, 22], [670, 22], [688, 22]);

  // ---- THE LAST BELL (704-766): SLUICE + BELL, the exam. Hold the sea out to cross; call it in to float the boat up the light's sea wall ----
  block(699, 700, 22, 23); block(701, 703, 20, 23); sluice('last', 702, 19, CW3.last.hold);   /* the sluice house: its stone stands over high water (act III's sea and the channel's meet against it) */
  for (const x of [707, 712, 717, 722, 727, 732, 737, 742, 747, 752]) block(x, x + 1, 28);
  block(757, 758, 28); bell('last', 757, 27, { swim: true });   /* THE LAST BELL, on the last stone (under the flood: ring it at low water) */
  net(704, 25, 31);
  air(759, 766, 20, 31); block(759, 766, 32);   /* the basin: mud at 32 */
  boat('last', 'b3', 760, 766, 31, 19);
  sign(696, 23, CW3_SIGNS.last);
  foe('petrel', 720, 23); foe('petrel', 744, 22);
  coins([708, 27], [718, 27], [728, 27], [738, 27], [748, 27], [762, 30]);
  ent('silver', 733, 37);   /* ACT III's SILVER: under the stones, on the channel bed */

  // ---- THE LIGHT'S HOLM (767-804): SHRINE THREE before the chase ----
  block(767, 800, 17); block(801, 802, 19); block(803, 804, 21);
  ent('check', CW3.checks[2][0], CW3.checks[2][1]); sign(784, 16, CW3_SIGNS.holm);
  deco('waystone', 776, 16); deco('wayShrine', 796, 16);
  foe('merrowbrute', 772, 16, { face: 1 });
  coins([770, 15], [780, 15], [793, 15]);

  // ---- THE COLLAPSE (805-903): the chase. The road on its piers, three 3-tile breaks, three arms that strike it ----
  road(805, 830); road(834, 856); road(860, 880); road(884, 903);
  for (const [a, b] of [[831, 833], [857, 859], [881, 883]]) { block(a, b, 36); net(a, 25, 31); net(b, 25, 31); }
  arm(CW3.chase.smash[0] + 1, { smash: true }); arm(842); arm(869); arm(893);
  coins([815, 23], [845, 23], [870, 23], [890, 23]);

  // ---- THE LIGHTHOUSE (904-932): its steps, its foot (the road goes through it), SHRINE FOUR at the boss door ----
  block(904, 905, 22); block(906, 907, 20); block(908, 928, 18);
  block(913, 920, 7, 17); air(913, 920, 15, 17);   /* the tower; the road through its foot */
  fill(910, 923, 7, 7, T.PLANK);   /* the lamp gallery round the top */
  ent('check', CW3.checks[3][0], CW3.checks[3][1]); sign(909, 17, CW3_SIGNS.lighthouse);
  block(929, 930, 20); block(931, 932, 22);
  coins([911, 16], [918, 16], [923, 16]);

  // =====================================================================================================================
  // THE KRAKEN'S REACH: master's columns 565-611 cell for cell at 933-979 (the end of the last mile, his reach, the wreck, the sea wall)
  // =====================================================================================================================
  for (let y = 0; y < H; y++) for (let x = KEEP0; x < R0.W; x++) set(x + OFF, y, R0.grid[y * R0.W + x]);
  for (const e of R0.ents) if (e.x >= KEEP0) ents.push({ ...e, x: e.x + OFF });
  for (const v of (R0.deep && R0.deep.vents) || []) if (v.x >= KEEP0) D.vents.push({ ...v, x: v.x + OFF });

  /* THE ROPES, LAST */
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  // =====================================================================================================================
  // THE WATER (src/tide-kit.js, kept on L.cw3Tides; src/pull-field.js on L.cw3Pulls - not L.tides/L.pulls: claude/water1's generic wiring steps those)
  // =====================================================================================================================
  const A = CW3.acts;
  pool('sea1a', 4, 103, A[0].hi); pool('chan1', CW3.race1.x0, CW3.race1.x1, CW3.race1.hi); pool('sea1b', 146, 300, A[0].hi);
  pool('sea2a', 301, 358, A[1].hi); pool('crypt', CW3.crypt.x0, CW3.crypt.x1, CW3.crypt.hi, { base: 39 * TS, bottom: 39 * TS });   /* (built at its FULL line: the reach model swims it so; the kit drains it on the first frame unless the lever's mark says full) */
  pool('arch', CW3.arch.x0, CW3.arch.x1, CW3.arch.y0, { base: 33 * TS, bottom: 33 * TS });
  pool('sea2b', 501, 593, A[1].hi);
  pool('sea3a', 594, 703, A[2].hi); pool('chan3', CW3.last.x0, 766, CW3.last.hi);
  pool('sea3c', 801, 932, CW3.LO);   /* THE COLLAPSE's sea stays out (the sea draws back before it comes): the road over it stays dry, the breaks are a fall */
  const krak = (R0.pools || []).find(p => p.krakenSea); if (krak) pools.push({ ...krak, x0: krak.x0 + OFF * TS, x1: krak.x1 + OFF * TS });
  const actTide = (a, poolIds, extra) => Object.assign({ id: a.id, pools: poolIds, lo: CW3.LO, hi: a.hi, cycle: CW3.cycle, rate: a.rate, safe: 'low', grace: 6, verbs: verbs[a.id], floats: floats[a.id] || [] }, extra || {});
  const tides = [
    actTide(A[0], ['sea1a', 'sea1b']),
    { id: 'race1', pools: ['chan1'], lo: CW3.race1.lo, hi: CW3.race1.hi, cycle: CW3.race1.cycle, first: 'high', safe: 'high', grace: 4, verbs: verbs.race1 },
    actTide(A[1], ['sea2a', 'sea2b']),
    { id: 'crypt', mode: 'manual', flip: 'fill', pools: ['crypt'], lo: CW3.crypt.lo, hi: CW3.crypt.hi, cycle: { rise: CW3.crypt.rise }, verbs: [{ t: 'lever', x: 408, y: 38, swim: true }] },
    actTide(A[2], ['sea3a']),
    { id: 'last', pools: ['chan3'], lo: CW3.last.lo, hi: CW3.last.hi, cycle: CW3.last.cycle, rate: CW3.last.rate, first: 'high', safe: 'high', grace: 4, verbs: verbs.last, floats: floats.last },
  ];
  const pulls = [
    { id: 'rip1', kind: 'current', box: [CW3.race1.x0, 24, CW3.race1.x1, 39], dir: [-1, 0], strength: CW3.rip, curve: 'flat', water: true, dashOut: true },
    { id: 'arch', kind: 'current', box: [CW3.arch.x0, CW3.arch.y0, CW3.arch.x1, CW3.arch.y1], dir: [1, 0], strength: CW3.arch.strength, curve: 'flat', water: true,
      tide: 'act2', phases: { rise: 1, high: 1, turn: 1, fall: -1, low: -1 }, posts: CW3.arch.posts.map(x => [x, 27]) },
    { id: 'rip3', kind: 'current', box: [CW3.last.x0, 20, CW3.last.x1, 39], dir: [-1, 0], strength: CW3.rip, curve: 'flat', water: true, dashOut: true },   /* (to the near bank's rungs at 704) */
  ];

  const kr = R0.arena, sh = v => v + OFF * TS;
  const out = {
    ...R0, W, H, grid, ents, pools, moversExtra: movers, rigBands, falls: [], interiors: [[375, 401, 10, 19, 'chapel']], airRooms, deep: D,
    START: { x: 3, y: 17 }, rule: CW3_RULE, cw3: true, checkRun: 320,   /* four shrines by hand (Daniel: fewer); the filler adds none between them */
    calm: [[0, CW3.END, 0, H]],   /* every foe on the new road is placed by hand: the sprinkler leaves it alone */
    causeTide: undefined, causeCurrents: undefined, causeBreakers: undefined, tidegates: false,   /* master's own road tide is folded into the kit (waterkit Q4) */
    causeFog: { x0: 878, x1: 934, lamp: [916.5, 5] },   /* THE LIGHT's beam cutting the fog at the end of the chase (master's fog, drawn by main.js) */
    causeLife: { gulls: [[188, 14], [330, 2], [498, 12], [916, 3]], smoke: [[183, 18]] },
    leviathan: R0.leviathan ? { ...R0.leviathan, arena: sh(R0.leviathan.arena) } : undefined,
    noDress: [[908, 925, 2, 8]],
    music: 'causeway', duskStart: 99999, duskLen: 1, night: false,
    /* THE STORM BUILDS: dusk over act II, night over act III (lightning lifts it: main.js darkZones storm + L.storm2) */
    darkZones: [{ x0: 306 * TS, x1: 594 * TS, y0: 0, y1: H * TS, dark: 0.26, storm: true }, { x0: 594 * TS, x1: 933 * TS, y0: 0, y1: H * TS, dark: 0.64, storm: true }],
    storm2: { every: 7, tell: 1.1, zones: [[606 * TS, 766 * TS]] },
    weather: [{ x0: 0, x1: 933 * TS, kind: 'rain' }, { x0: 933 * TS, x1: 99999, kind: 'mist' }],
    reachDoors: [{ x0: CW3.lampGate.col, x1: CW3.lampGate.col, y0: 0, y1: 23 }],
    routeSupports: supports,
    cw3Tides: tides, cw3Pulls: pulls, cw3Props: props, cw3Arms: arms, cw3Lamps: lamps, cw3Chase: { ...CW3.chase },
    cw3Boats: Object.values(floats).flat().map(f => ({ ...f, x: f.x0 })), cw3Verbs: Object.values(verbs).flat().map(v => ({ ...v })),
    sections: CW3.sections.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''), name, x0, x1 })),
    arena: { ...kr, x0: sh(kr.x0), x1: sh(kr.x1), trigger: sh(kr.trigger), wallL: kr.wallL + OFF, wallR: kr.wallR + OFF, tower: sh(kr.tower), plinth: kr.plinth.map(sh), stones: kr.stones.map(sh),
      holes: kr.holes.map(([a, b]) => [a + OFF, b + OFF]), wreck: kr.wreck.map(v => v + OFF), rest: sh(kr.rest) },
  };
  return out;
}

/* THE TABLES THAT NAME MASTER'S CAUSEWAY BY COLUMN (src/level.js AMBUSH / ELITES, src/checkpoint-thin.js CHECK_DROP, src/stuck-spots.js STUCK / STUCK_SIGNS,
   src/variety-pass.js TIDE_CRABS): with the flag ON their 'causeway' rows are these (a getter, read at build time); OFF, master's own objects. */
export const CW3_TABLES = {
  AMBUSH: [{ name: 'THE DROWNED CHAPEL', row: 19, wallL: 374, wallR: 402, check: false,
    waves: [[['tideguard', 398], ['sailor', 378], ['netter', 386], ['merrowcaller', 392]]] }],
  ELITES: [['tideguard', 556, 23, { gate: 564 }]],
  CHECK_DROP: [],
  TIDE_CRABS: { swap: {}, add: [] },
  STUCK: [
    { id: 'cw3-stones', zone: [96, 0, 147, 39], at: [100, 19], glint: 'stall', line: 'THE CHANNEL IS IN NEARLY ALWAYS: TURN THE SLUICE WHEEL, THEN WALK THE STONES' },
    { id: 'cw3-cove', zone: [148, 0, 176, 33], at: [157, 19], glint: 'stall', line: 'THE BOAT RISES TO THE SEA WALL AT HIGH WATER: RING THE HAMLET BELL' },
    { id: 'cw3-gun', zone: [203, 0, 239, 24], at: [233, 23], glint: 'stall', line: 'STRIKE THE GUN\'S BREECH: IT CLEARS THE TOWER' },
    { id: 'cw3-wreck', zone: [306, 0, 314, 30], at: [314, 17], glint: 'stall', line: 'HER SHROUDS HANG OVER HIGH WATER: WAIT FOR THE FLOOD AND SWIM UP' },
    { id: 'cw3-crypt', zone: [405, 20, 433, 39], at: [408, 38], glint: 'stall', line: 'THE FLOODGATE LEVER: FLOOD THE UNDERCROFT AND SWIM TO THE DOOR' },
    { id: 'cw3-arch', zone: [433, 25, 496, 33], at: [450, 27], glint: 'stall', line: 'THE ARCH RUNS AGAINST THE EBB: HOLD THE RING (UP) AT AN AIR BELL UNTIL THE FLOOD' },
    { id: 'cw3-gate', zone: [684, 0, 697, 24], at: [690, 23], glint: 'stall', line: 'THE GATE OPENS TO A LIT LAMP: STRIKE THE STORM LAMP TWICE' },
    { id: 'cw3-last', zone: [698, 0, 767, 39], at: [702, 19], glint: 'stall', line: 'TURN THE SLUICE, CROSS THE STONES, RING THE LAST BELL, RIDE THE BOAT UP' },
  ],
  STUCK_SIGNS: { fix: [], add: [] },
};
export function shadowCauseway(tables) {
  for (const [name, tb] of Object.entries(tables)) {
    if (!tb || !(name in CW3_TABLES)) continue;
    const master = tb.causeway;
    try { Object.defineProperty(tb, 'causeway', { configurable: true, enumerable: true, get: () => (cw3On() ? CW3_TABLES[name] : master), set: v => { tb.__cwMaster = v; } }); } catch { /* frozen: leave it */ }
  }
}

/* THE LEVEL'S OWN CHECKS (tools/causeway3.mjs) -> [problems] */
export function lintCauseway3(L, T) {
  const bad = [], at = (x, y) => L.grid[y * L.W + x];
  const tide = id => L.cw3Tides.find(t => t.id === id);
  for (const T0 of L.cw3Tides) for (const v of T0.verbs || []) {
    if (at(v.x, v.y) !== T.AIR && at(v.x, v.y) !== T.NET) bad.push(T0.id + ' ' + v.t + ' at ' + v.x + ',' + v.y + ' is buried');
    if (at(v.x, v.y + 1) !== T.SOLID) bad.push(T0.id + ' ' + v.t + ' at ' + v.x + ',' + v.y + ' stands on nothing');
  }
  for (const a of CW3.acts) { const t = tide(a.id); if (!t) { bad.push('no tide for ' + a.id); continue; }
    const sum = Object.values(t.cycle).reduce((s, v) => s + v, 0) / t.rate; if (Math.abs(sum - a.every) > 0.05) bad.push(a.id + ' turns every ' + sum.toFixed(2) + ' s, not ' + a.every); }
  const checks = L.ents.filter(e => e.t === 'check' && e.x <= CW3.END);
  if (checks.length !== CW3.checks.length + 1) bad.push('the new road has ' + checks.length + ' shrines (want START + ' + CW3.checks.length + ')');
  const gob = L.ents.filter(e => e.x <= CW3.END && /gob|goblin/i.test(e.t + ' ' + (e.kind || '') + ' ' + (e.skin || ''))); if (gob.length) bad.push('goblin kinds on the new road: ' + gob.map(e => e.t).join(','));
  if (L.ents.some(e => e.x <= CW3.END && e.t === 'deco' && /tribute|driftwood|log/i.test(e.kind || ''))) bad.push('a tribute cairn / driftwood / log on the new road (theme fit)');
  if (!L.arena || L.arena.boss !== 'kraken') bad.push('the arena is not the Kraken\'s');
  if (L.arena && L.arena.x1 !== (610 + CW3.OFF) * 16) bad.push('the reach is not at its shifted columns');
  for (const b of L.moversExtra.filter(m => m.cw3 === 'float')) { const f = L.cw3Boats.find(q => q.id === b.fid); if (!f) bad.push('boat ' + b.fid + ' has no float'); }
  if (L.ents.filter(e => e.t === 'silver').length !== 3) bad.push('silvers: ' + L.ents.filter(e => e.t === 'silver').length + ' (want 3: save bits)');
  for (const a of L.cw3Arms) if (at(a.x, CW3.R) !== T.SOLID && !a.smash) bad.push('the arm at ' + a.x + ' strikes no road');
  if (at(CW3.lampGate.col, 10) !== T.PORT) bad.push('the pilgrims\' gate is not laid');
  return bad;
}
