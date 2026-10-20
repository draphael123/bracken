/* src/marsh3.js - MARSH WOOD 3: THE LONGER MARSH (claude/marsh3; scratch/brief-marsh3-1020.md item 3, Daniel 10-20: "LONGER LEVEL (+40-50%): new sections on the raft
   + hurting water - a RAFT RUN, RAFT + PADS (hop to a pad chain to work a lever that opens the raft's way), a NIGHT stretch where marsh lights show which pads hold").
   Applied to the BUILT marsh after src/marsh2.js, in FINAL columns: AT_COL columns open between the grove dock's shrine (440) and THE MUD FLATS (the exam), and the
   exam and the King's court slide right by N (src/level.js grow). Every number below is a column you can find on the map (AT_COL + dx).
     A. THE REED RUN (dx 0-81)    a raft on the CURRENT (main.js stepCurrentRaft: board her and the water takes her, no pole, no crank) through a maze of REED STANDS
                                  standing up out of the channel - low ones you step over, tall ones you hop onto and off - with frogs climbing aboard out of the water,
                                  a frog on a tall stand, a spitter on a reed tuft over the run and a bowman on a stilt lookout at its end. Shrine on the far bank.
     B. THE BOOM (dx 82-151)      a second current raft, and a LOG BOOM across her water (a T.PORT column at her row: she stops at its face). Step over the boom onto a
                                  CHAIN OF PADS - the firm ones (cool green) and the sinking ones (yellow) - to the boom's LEVER on a stilt deck; strike it, hop back,
                                  and ride her on over the open water the pads never cross. The exam: a thorn on the narrow far bank as she docks. Shrine after it.
     C. THE NIGHT PADS (dx 152-225) a pad crossing in the DARK (a dark zone, 0.74): a MARSH LIGHT stands over every pad that holds (pad lamp: true - src/redraw/lilypad.js),
                                  the sinking ones are dark leaves you cross without stopping. Three river eels in the gaps make you WAIT - and you can only wait on a lit
                                  pad; a spitter on a reed bed and a wasp over the water. Shrine on the far bank, at the exam's door.
   The water bites everywhere (the level's waterHurts). A shrine per new section (Daniel's brief). Foes are designed here, not garrisoned (the new columns are calm). */
export const AT_COL = 444, N = 226;
export const SECTIONS = { reedrun: [0, 81], boom: [82, 151], night: [152, 225] };
export const REED_STANDS = [[16, 18], [26, 17], [36, 18], [37, 18], [47, 18], [57, 18], [66, 17]];   /* [dx, top row]: a SOLID column from the bed up to `top` (18 low: a step; 17 tall: a hop) */
export const BOOM = { dx: 108, rows: [18, 21], lever: [127, 16] };
export const NIGHT_PADS = [[158, 'L', 1], [161, 's'], [164, 's'], [167, 'L'], [170, 's'], [173, 's'], [176, 's'], [180, 'L', 1], [188, 's'], [191, 'L'], [194, 's'], [197, 's'],
  [200, 'L', 1], [204, 's'], [207, 's'], [210, 'L'], [213, 's'], [216, 'L', 1]];   /* [dx, L = firm with a marsh light / s = sinks, big] */
export const NIGHT_DARK = 0.74;
export const BOOM_PADS = [[110, 'L'], [113, 's'], [116, 'L'], [119, 's'], [122, 'L', 1]];   /* [dx, L firm / s sinks, big] - the chain from the boom to the lever's deck (dx 125-128) */
export const BANK_WALKS = [[0, 5], [77, 85], [148, 155], [220, 225]];   /* [dx0, dx1] on row 15 */
export function applyMarsh3(M, T, TS, grow) {
  const o = AT_COL, G = grow(M, M, o, N), X = dx => o + dx;
  const { set, block, reeds, ent, coins } = G;
  const water = (x0, x1, bed = 22) => { G.R.pools.push({ x0: X(x0) * TS, x1: (X(x1) + 1) * TS, y: 19 * TS, shallow: false, depth: 0, bottom: bed * TS, marsh3: true }); block(X(x0), X(x1), bed, M.H - 1); };
  const bank = (x0, x1) => block(X(x0), X(x1), 18, M.H - 1);
  const plank = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(X(x), y, T.PLANK); };
  const foe = (t, dx, y, op = {}) => ent(t, X(dx), y, { face: -1, ...op });
  const movers = G.R.moversExtra;
  /* ---- A. THE REED RUN ---- */
  bank(0, 5);
  ent('sign', X(2), 17, { text: 'THE REED RUN. BOARD THE RAFT AND THE CURRENT TAKES HER: HOP THE REED STANDS IN HER WAY.' });
  water(6, 75);
  for (const [dx, top] of REED_STANDS) block(X(dx), X(dx), top, 21);
  movers.push({ kind: 'raft', current: true, x0: X(6) * TS, x1: X(76) * TS - 96, x: X(6) * TS, y: 18 * TS + 8, w: 96, h: 8, speed: 34, frogs: true, frogMax: 2, frogEvery: 3.4 });
  reeds(X(30), 13, 2); reeds(X(52), 13, 2); reeds(X(41), 10, 2);   /* the high road: reed tufts over the run (a spitter on the first; the silver over the middle one) */
  foe('hopper', 30, 12, { color: 'yellow' }); foe('hopper', 47, 16, { color: 'yellow' });   /* a frog on the tall stand: it leaps aboard as she comes (a heron standing there shoved every hero off the back) */ ent('silver', X(41), 9);
  plank(70, 74, 12); foe('archer', 72, 11);   /* the bowman's stilt lookout at the run's end: he looses at the raft as she comes in */
  coins([X(16), 15], [X(26), 14], [X(31), 11], [X(36), 15], [X(47), 13], [X(53), 11], [X(57), 15], [X(66), 14]);
  bank(76, 85);
  ent('check', X(79), 17);
  /* ---- B. THE BOOM ---- */
  ent('sign', X(83), 17, { text: 'A LOG BOOM STOPS THE RAFT. HOP THE PADS TO ITS LEVER, STRIKE IT, THEN RIDE ON.' });
  water(86, 145);
  movers.push({ kind: 'raft', current: true, x0: X(86) * TS, x1: X(146) * TS - 96, x: X(86) * TS, y: 18 * TS + 8, w: 96, h: 8, speed: 32, frogs: true, frogMax: 1, frogEvery: 4 });
  for (let y = BOOM.rows[0]; y <= BOOM.rows[1]; y++) set(X(BOOM.dx), y, T.PORT);   /* the boom: sunk logs from the bed to her row (drawn as the marsh's gate, src/barriers.js 'sunklogs') */
  for (const [dx, kind, big] of BOOM_PADS) ent('pad', X(dx), 18, { firm: kind === 'L', big: !!big });   /* a firm pad off the boom and one under the deck: the sinking ones between are the quick hops */
  plank(125, 128, 17);   /* the lever's stilt deck: two rows over the water (a hop off a pad); the raft passes through under it - a one-way board does not stop a rider */
  ent('lever', X(BOOM.lever[0]), BOOM.lever[1], { openColumn: [X(BOOM.dx), BOOM.rows[0], BOOM.rows[1]], say: 'THE BOOM SWINGS OPEN' });
  reeds(X(115), 12, 2); foe('spit', 115, 11);   /* the spitter lobs onto the pad chain from a reed tuft over it (on the lever's deck it knocked every hero back into the water) */
  coins([X(113), 16], [X(119), 16], [X(127), 13], [X(136), 15], [X(140), 15]);
  bank(146, 155);
  foe('thorn', 150, 17);   /* THE EXAM: on the narrow bank she docks at, the water at your back (four strides in: at the bank's lip he threw every hero back off the raft) */
  ent('check', X(154), 17);
  /* ---- C. THE NIGHT PADS ---- */
  ent('sign', X(153), 17, { text: 'NIGHT ON THE WATER. A MARSH LIGHT STANDS OVER EVERY PAD THAT HOLDS. THE DARK ONES SINK.' });
  water(156, 219);
  for (const [dx, kind, big] of NIGHT_PADS) ent('pad', X(dx), 18, kind === 'L' ? { firm: true, lamp: true, big: !!big } : { big: !!big });
  reeds(X(184), 17, 2); reeds(X(187), 12, 2);   /* a reed bed halfway: a rest; a spitter lobs at it from a tuft over the water beyond (on the bed itself it shoved every hero back in) */
  for (const dx of [171, 195, 213]) foe('eel', dx, 20, { leap: true });
  foe('hopper', 186, 16, { color: 'yellow' }); foe('wasp', 203, 13, { pogo: true });   /* (marsh3fix) a frog holds the reed bed instead of a spitter on its tuft: ranged share under the 30% cap */
  coins([X(164), 16], [X(176), 16], [X(184), 14], [X(197), 16], [X(207), 16]);
  bank(220, 225);
  foe('turtle', 221, 17); ent('check', X(223), 17);
  /* THE BANK WALKS: a stilt walk over each new bank (the marsh folk's boards, src/marsh2.js STILTS), three rows up - a second height on the banks only, never over the water a raft or a pad chain carries you across */
  for (const [x0, x1] of BANK_WALKS) plank(x0, x1, 15);
  G.R.darkLocal = true; G.R.darkZones = (G.R.darkZones || []).concat([{ x0: X(150) * TS, x1: X(222) * TS, y0: 0, y1: M.H * TS, dark: NIGHT_DARK, marsh3: true }]);
  const R = G.done();
  /* the exam's sign stood on the old bank before the cut (it said THE MUD FLATS at the grove dock): it goes to the mud flats' own bank */
  const ms = R.ents.find(e => e.t === 'sign' && /^THE MUD FLATS/.test(e.text || '')); if (ms) ms.x = X(N) + 1;
  /* the calm box over the old exam's first step (440-452) spanned the cut: it is two boxes again, and the new columns are calm (their foes are designed above) */
  R.calm = (R.calm || []).flatMap(([x0, x1, y0, y1]) => x0 < o && x1 >= o + N ? [[x0, o - 1, y0, y1], [o + N, x1, y0, y1]] : [[x0, x1, y0, y1]]).concat([[o, o + N - 1, 0, M.H - 1]]);
  R.marsh3 = { at: o, n: N };
  /* THE ROUTE GOES TO THE LEVER AND BACK TO THE RAFT (tools/pacing.mjs L.routeVia, in order): the reach fill would ride her through the shut boom */
  R.routeVia = (R.routeVia || []).concat([[X(BOOM.lever[0]), BOOM.lever[1]], [X(BOOM.dx), 17]]);
  return R;
}
