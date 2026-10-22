/* src/frog-court.js - THE CROAKING COURT AS A PAD CHASE (claude/frogking2; scratch/brief-playtest-1021b.md item 2, Daniel 10-21: "FROG KING doesn't use
   the level's mechanics -> rework: he is (almost) always vulnerable but you must CROSS PADS to reach him - a longer pad section, sinking/holding pads,
   he sits on a big pad/platform you can hit, then LEAPS away to another and it repeats").
   The court was a shallow pond and a dais (42 columns). It is OPEN WATER now - the marsh's biting water - with THREE ROYAL PADS standing out of it, and
   between them three LANES of lily pads, the marsh's own verb: the yellow ones SINK under you, the cool green ones HOLD (src/redraw/lilypad.js).
     THE ENTRY BANK   (dx 1-8)    the shrine side; the fight wakes as you step onto it
     LANE A           (dx 9-22)   four pads
     THE FIRST PAD    (dx 23-29)  ROYAL PAD I - he sits here when he wakes
     LANE B           (dx 30-43)  four pads
     THE SECOND PAD   (dx 44-50)  ROYAL PAD II
     LANE C           (dx 51-64)  four pads
     THE THRONE BANK  (dx 65-76)  his throne: ROYAL PAD III, where he goes at half
   The royal pads are solid (drawn as giant royal leaves), so a fall in the water hands you back to the last one you stood on. When he LEAPS to another
   royal pad the lanes RESHUFFLE: every leaf nobody stands on goes under and comes up again somewhere else in its lane (src/frog-king.js reshuffle).
   Columns are dx from the old court's west wall (682 in the final marsh). */
export const LANES = [[9, 22], [30, 43], [51, 64]];          /* [dx0, dx1] water */
export const ROYAL = [[23, 29], [44, 50], [65, 76]];         /* [dx0, dx1] solid footing: the three stations */
export const ENTRY = [1, 8], WALL_R = 77, GROW = 33;          /* the court is 33 columns longer than the old one */
export const LANE_SLOTS = [2, 5, 8, 11];                     /* a lane's leaves, dx into the lane (the slot is moved +-6 px by a reshuffle) */
export const LANE_FIRM = [[0, 2], [1, 3], [0, 3]];          /* which slots HOLD in each lane as built (the rest sink) */
export const THRONE_DX = 71;
export function applyFrogCourt(M, T, TS, grow) {
  const A0 = M.arena; if (!A0 || A0.boss !== 'frog') return M;
  const wl = A0.wallL, G = grow(M, M, M.W - 1, GROW), R = G.R, X = dx => wl + dx, H = M.H;
  const { set, block, ent } = G;
  /* the old court goes: its shallow pond, its dais, its pads, its throne, its statues, its lanterns, its gold (the entry bank stays, with its spitter) */
  const old0 = X(ENTRY[1] + 1);
  R.pools = (R.pools || []).filter(p => p.x1 <= old0 * TS);
  const kill = e => e.x >= old0 && ['pad', 'throne', 'frog', 'deco', 'coin', 'silver'].includes(e.t);
  M.ents = M.ents.filter(e => !kill(e));
  for (let x = old0; x < R.W; x++) for (let y = 0; y < H; y++) G.grid[y * R.W + x] = T.AIR;
  /* the court as built: lanes of biting water with a bed, royal pads and the throne bank standing out of it */
  for (const [a, b] of LANES) { block(X(a), X(b), 22, H - 1); R.pools.push({ x0: X(a) * TS, x1: (X(b) + 1) * TS, y: 19 * TS, shallow: false, depth: 0, bottom: 22 * TS, frogLane: true }); }
  for (const [a, b] of ROYAL) block(X(a), X(b), 18, H - 1);
  block(X(ENTRY[0]), X(ENTRY[1]), 18, H - 1);   /* the entry bank: the old shallow pond began under its last two columns */
  block(X(WALL_R), X(WALL_R + 1), 0, H - 1);
  LANES.forEach(([a], li) => LANE_SLOTS.forEach((s, k) => ent('pad', X(a + s), 18, { firm: LANE_FIRM[li].includes(k), frogLane: li, slot: k })));
  ent('throne', X(THRONE_DX), 17); ent('frog', X(ROYAL[0][0] + 3), 17);
  ent('deco', X(ROYAL[0][0] + 1), 17, { kind: 'frogStatue', v: 0 }); ent('deco', X(ROYAL[1][1] - 1), 17, { kind: 'frogStatue', v: 1 }); ent('deco', X(THRONE_DX + 4), 17, { kind: 'frogStatue', v: 0 });
  ent('deco', X(ROYAL[1][0] + 1), 17, { kind: 'lilyLantern' }); ent('deco', X(THRONE_DX - 4), 17, { kind: 'lilyLantern' });
  R.arena = { ...A0, x1: X(WALL_R) * TS, wallR: X(WALL_R), dais: { x0: X(ROYAL[2][0]) * TS, x1: (X(ROYAL[2][1]) + 1) * TS, h: 16 }, frogChase: true,
    royal: ROYAL.map(([a, b]) => ({ x0: X(a) * TS, x1: (X(b) + 1) * TS, cx: (X(a) + X(b) + 1) * TS / 2 })), lanes: LANES.map(([a, b]) => ({ x0: X(a) * TS, x1: (X(b) + 1) * TS })) };
  R.calm = (R.calm || []).concat([[X(0), X(WALL_R), 0, H - 1]]);   /* the court is his: nothing is garrisoned in it */
  const out = G.done(); out.frogCourt = { wl, lanes: LANES.map(([a, b]) => [X(a), X(b)]), royal: ROYAL.map(([a, b]) => [X(a), X(b)]) };
  return out;
}
