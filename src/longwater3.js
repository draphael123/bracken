// src/longwater3.js - THE LONG WATER 3: SALTREACH, "THE TIDE DECIDES WHERE THE FLOOR IS." (claude/longwater3, the OPUS GREYBOX, 11-07). Behind its flag; the live
// Long Water is unchanged with it off. Sources: scratch/plan-water-1105.md item 1 + s2/s3a/s4 (the plan wins), scratch/brief-longwater3-1015.md (Daniel 10-15 interview).
//
// THE FLAG: LW3_SHIPS = false. OFF, src/level.js builds master's Long Water exactly (tools/longwater3.mjs holds its hash). ON (?lw3=1 on the page, globalThis.BRACKEN_LW3,
// or LW3=1 in a Node tool's env) the SAME ROAD SLOT ('longwater', needs 'crown': no index, no save moves) builds LONG WATER 3:
//   cols   0-365  master's Long Water, cell for cell: the Meltfalls, the Linn, the ferry run and THE BORE REACH (the S3 raft arrival bank stays: plan line 88)
//   cols 366-705  SALTREACH, rebuilt on THE TIDE KIT (src/tide-kit.js): the tide is the player's verb -
//                   THE SEA BELL calls it IN early (three strokes, then it comes); THE SLUICE WHEEL holds it BACK (the water turned and kept out)
//     366-411  THE STAITHE (teach the BELL): the high street, smokehouses, nets, the first bell; THE COVE - ring it and the beached boat floats up into a bridge
//     412-455  THE TIDE POOLS (teach the CRAB, the bell's 2nd use): the flats at low water are THE TIDE-POOL CRABS' (src/pool-crab.js); the sea wall wants HIGH
//              water to climb - ring the bell from the street and the patrol digs in under it (flood out a patrol); a FISH TRAP over a pool (cut it: it crushes)
//     456-497  THE MILL RACE (teach the SLUICE): the race runs under the mill and nothing swims against it; turn the wheel, the race drains, walk the bed
//     498-545  THE NET LOFTS (A14 platforming, the sluice's 2nd use): barnacled pier stumps over the loft cove; the silver lies on the sump's bed, the jellies come
//              in with the tide - hold the sea out to reach it; a FISH TRAP of coins; the ELITE's gate at the end (ELITES shadow row)
//     546-585  THE LOW STREET (the AMBUSH, AMBUSH shadow row)
//     586-633  THE PIERS - THE EXAM (bell + sluice + crab + trap + boat, the harbour's own fast tide): the jellies ride the flood, so turn the SLUICE and cross the
//              crab flats at low water, cut the moored boat loose, ring the BELL on the rock beside it and ride it up to the pier head
//     634-649  THE HEADLAND: the boss door's shrine under THE TIDE-CLOCK LIGHTHOUSE (the landmark: its dial is drawn on the horizon the whole level, A3)
//     650-696  THE TIDE FLATS: THE TIDE HERALD (src/tide-herald.js; the bell on the west stone, the wheel on the mid-flats stone) - opened by the BELL (lure him out onto the flats; a called sea goes back out fast and leaves
//              him in the mud = MIRED) and by the SLUICE (pull the sea out from under him); phase two the sea is his, the bell breaks his call, the sluice drops it
// Theme (plan s4): pale sea-mist + lantern amber, wet sand, kelp, barnacled stone piers; timber ONLY as boats (tarred hulls). No goblins: master's tribute chest
// (the goblin queen's seals, lw_props.js) is not placed here, and the dead-end stash prop is a sea chest under the flag (shadowed table below).
// Checkpoints: master's river keeps its two (95, 238 after the thinning); Saltreach has TWO (the Staithe, the boss door) - master's tail had three.

export const LW3_SHIPS = false;
export function lw3On() {
  if (LW3_SHIPS) return true;
  try { if (globalThis.BRACKEN_LW3 === true || globalThis.BRACKEN_LW3 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]lw3=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.LW3 === '1') return true; } catch { /* no node */ }
  return false;
}

/* THE NUMBERS. Columns and rows are the level's own (final). ST = the high street's top row, FL = the flats' top row */
export const LW3 = {
  KEEP: 365, X0: 366, W: 706, H: 40, TS: 16, ST: 23, FL: 31,
  /* THE BAY: the village's sea clock (the lighthouse dial). Mostly high water: the sea is in more than it is out */
  bay: { lo: 33, hi: 24, cycle: { low: 6, warn: 3, rise: 3, high: 10, turn: 2, fall: 3 } },
  /* THE MILL RACE: high nearly always; its own low is too short to walk (1.5 + 2 told) - the wheel holds it out 10 s */
  race: { lo: 35, hi: 28, cycle: { high: 12, turn: 2, fall: 2, low: 1.5, warn: 2, rise: 2 }, hold: 10, carry: 120, x0: 462, x1: 489 },
  /* THE HARBOUR (the exam): a quick tide, mostly in, and the jellies come in with it */
  harbour: { lo: 33, hi: 28, cycle: { low: 3, warn: 2, rise: 2, high: 10, turn: 1.5, fall: 2 }, hold: 10 },
  /* THE TIDE FLATS (the Herald's arena): the boss drives it; its fall is quick so the sluice's drop is a snap */
  square: { lo: 33, hi: 28, cycle: { low: 8, warn: 2, rise: 2, high: 8, turn: 1.5, fall: 1.2 }, hold: 5, calledHigh: 3 },
  bayHold: 8,
  sections: [['THE STAITHE', 366, 411], ['THE TIDE POOLS', 412, 455], ['THE MILL RACE', 456, 497], ['THE NET LOFTS', 498, 545], ['THE LOW STREET', 546, 585],
    ['THE PIERS', 586, 633], ['THE HEADLAND', 634, 649], ['THE TIDE FLATS', 650, 705]],
  arena: { x0: 651, x1: 695, wallL: 650, wallR: 696, floor: 31, trigger: 653, stones: [[658, 660], [672, 673], [686, 688]], gate: 700 },
  checks: [[373, 22], [640, 23]],
  stingers: { dmg: 6, every: 0.5 },
  trap: { dmg: 80, coins: 4, g: 900 },
};
export const LW3_RULE = 'THE TIDE DECIDES WHERE THE FLOOR IS.';
export const LW3_SIGNS = {
  intro: 'SALTREACH. THE TIDE DECIDES WHERE THE FLOOR IS. THE LIGHTHOUSE DIAL ON THE HEADLAND SAYS WHEN IT TURNS.',
  bell: 'THE SEA BELL CALLS THE TIDE IN EARLY: THREE STROKES, THEN IT COMES. THE BOATS FLOAT ON IT.',
  pools: 'THE POOL CRABS COME UP AT LOW WATER. RING THE BELL AND THEY DIG IN. THE SEA WALL WANTS HIGH WATER.',
  race: 'THE MILL RACE RUNS UNDER THE MILL AND NOTHING SWIMS AGAINST IT. TURN THE SLUICE WHEEL: IT HOLDS THE WATER BACK, AND YOU WALK THE BED.',
  lofts: 'THE JELLIES COME IN WITH THE TIDE. THE SLUICE WHEEL HOLDS THE SEA OUT OF THE LOFT COVE A WHILE.',
  trap: 'A FISH TRAP HANGS ON ONE ROPE. CUT IT AND IT DROPS WHAT IT HOLDS.',
  piers: 'THE HARBOUR: THE JELLIES RIDE THE FLOOD. HOLD THE SEA OUT, CUT THE BOAT LOOSE, RING HER UP TO THE PIER HEAD.',
  boss: 'THE HERALD WALKS ON THE WATER. CALL THE SEA, THEN TAKE IT FROM UNDER HIM.',
  low: 'THE LOW STREET. THEY WAIT FOR THE TIDE TO BRING THEM.',
};

/* THE BUILD. R = master's built Long Water (the whole of it); out = Long Water 3 (a new object; R is not mutated past its arrays being read). Pure. */
export function buildLongWater3(R, T, TS = 16) {
  const { W, H, X0, ST, FL } = LW3;
  const grid = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < X0; x++) grid[y * W + x] = R.grid[y * R.W + x];
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const ground = (x0, x1, top) => fill(x0, x1, top, H - 1, T.SOLID);
  const air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR);
  const net = (x, y0, y1) => fill(x, x, y0, y1, T.NET);
  const supports = (R.routeSupports || []).filter(p => p.x < X0).map(p => ({ ...p }));
  const plat = (x, y, n) => { fill(x, x + n - 1, y, y, T.ONEWAY); for (const px of [...new Set([x, ...Array.from({ length: n }, (_, i) => x + i).filter(q => (q - x) % 3 === 0), x + n - 1])]) { let b = y + 1; while (b < H - 1 && grid[b * W + px] === T.AIR) b++; if (b - y >= 2) supports.push({ x: px, y, bottom: b, kind: 'hcpier' }); } };   /* a stone pier at each end and every third column (src/route-art.js draws hcpier as stone) - lay plats AFTER their ground */   /* KELP ropes / net ladders up a wall (art owed: kelp + barnacled rope) */
  const ents = R.ents.filter(e => e.x < X0).map(e => ({ ...e }));
  const ent = (t, x, y, o) => ents.push({ t, x, y, ...(o || {}) });
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const deco = (x, y, kind, v) => ent('deco', x, y, { kind, ...(v !== undefined ? { v } : {}) });
  const pools = (R.pools || []).filter(p => p.x0 < X0 * TS && !p.streetTide && !p.arenaTide).map(p => ({ ...p }));
  const pool = (id, x0, x1, bed, line) => pools.push({ id, x0: x0 * TS, x1: (x1 + 1) * TS, y: line * TS, base: bed * TS, bottom: bed * TS, swim: true, sea: true, clear: true, lw3: true });
  const floats = { bay: [], harbour: [] }, movers = (R.moversExtra || []).filter(m => (m.x0 ?? m.px ?? m.x ?? 0) < X0 * TS).map(m => ({ ...m })), rigBands = [];
  const boat = (tide, id, x0, x1, rest, top, free, moor) => { floats[tide].push({ id, x0, x1, y: rest, top, free }); rigBands.push([x0, x1, top, rest]);
    movers.push({ kind: 'lw3boat', lw3: 'float', fid: id, tide, moor: moor || null, x: x0 * TS, x0: x0 * TS, y: rest * TS, rest: rest * TS, w: (x1 - x0 + 1) * TS, h: 8 }); };
  const bells = [], sluices = [], traps = [], moors = [], props = [], bites = [], races = [];
  const bell = (tide, x, y) => { bells.push({ tide, x, y }); ent('lw3bell', x, y, { tide }); };
  const sluice = (tide, x, y, hold) => { sluices.push({ tide, x, y, hold }); ent('lw3sluice', x, y, { tide }); };
  const trap = (id, x, y, kind, n) => { traps.push({ id, x, y, kind, n: n || 0 }); ent('lw3trap', x, y, { id }); };
  const prop = (kind, x, y, o) => props.push({ kind, x, y, ...(o || {}) });   /* GREYBOX set dressing the hands draw (smokehouses, gulls, locals, the lighthouse) */
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));

  /* clear the tail: master's Saltreach, Sluice Stair and Square go */
  air(X0, W - 1, 0, H - 1);

  // ================= THE LANDING (366-369): up off the Bore Reach's bank into the town =================
  ground(366, 367, 25); ground(368, 369, 24);

  // ================= 1. THE STAITHE (370-411): TEACH THE BELL =================
  ground(370, 381, ST);
  plat(371, 19, 4); coins([372, 18], [374, 18]);   /* the smokehouse roofs: a second height over the street (posts: src/island-posts.js) */
  sign(371, 22, LW3_SIGNS.intro); ent('check', LW3.checks[0][0], LW3.checks[0][1]);
  prop('smokehouse', 372, 22); deco(376, 22, 'fishCottage', 0); deco(379, 22, 'netPoles');
  prop('local', 375, 22, { home: 376 }); prop('local', 378, 22, { home: 376 });
  bell('bay', 380, 22);
  /* THE COVE (382-394): mud at low water, a boat beached on it; ring the bell and she floats up between the two quays (a 3-tile hop each side) */
  ground(382, 394, 33); net(382, 23, 32);   /* the kelp ladder back up out of the mud */
  boat('bay', 'b1', 385, 391, 32, 23, 4);
  coins([384, 32], [386, 31], [388, 31], [390, 31], [393, 32]);
  ground(395, 411, ST); plat(400, 19, 6); coins([401, 18], [403, 18], [405, 18]);   /* the smokehouse roofs: a second height over the street */
  sign(397, 22, LW3_SIGNS.bell); deco(400, 22, 'fishCottage', 1); prop('smokehouse', 404, 22); deco(407, 22, 'netPoles'); deco(402, 22, 'seaLantern', 1);
  prop('local', 399, 22, { home: 400 }); prop('local', 403, 22, { home: 400 }); prop('gulls', 406, 22);
  sign(408, 22, LW3_SIGNS.pools); bell('bay', 410, 22);
  coins([372, 21], [375, 20], [398, 21], [401, 21], [405, 20]);

  // ================= 2. THE TIDE POOLS (412-455): TEACH THE CRAB; THE BELL FLOODS OUT THE PATROL =================
  ground(412, 413, 25); ground(414, 415, 27); ground(416, 417, 29); ground(418, 447, FL);
  for (const [a, b] of [[422, 425], [431, 434], [440, 443]]) air(a, b, FL, 33);   /* the pools: cut to the bed (row 34), a row of water in each at low */
  ground(448, 455, ST);   /* THE SEA WALL: eight rows over the flats - climb it out of HIGH water */
  foe('poolcrab', 423, 33, { face: 1 }); foe('poolcrab', 433, 33); foe('poolcrab', 437, 30); foe('poolcrab', 441, 33);
  trap('t1', 433, 28, 'crush');
  coins([419, 30], [427, 30], [429, 30], [436, 29], [445, 30], [424, 33], [442, 33]);
  pool('flats', 412, 447, 34, LW3.bay.hi);
  deco(452, 22, 'seaLantern', 1);

  // ================= 3. THE MILL RACE (456-497): TEACH THE SLUICE (required: the race's own low is too short to walk) =================
  ground(456, 457, ST); ground(458, 461, 28); net(458, 23, 27);
  sign(456, 22, LW3_SIGNS.race); sluice('race', 460, 27, LW3.race.hold);
  fill(462, 489, 0, 27, T.SOLID); ground(462, 489, 35);   /* THE MILL, built into the bluff over the race: its floor is the race's roof (it hangs on the bluff, not on air: anchor-lint) */
  prop('millwheel', 470, 27);
  ground(490, 491, 32); ground(492, 493, 29); ground(494, 495, 26); ground(496, 497, ST);
  coins([465, 34], [470, 34], [475, 34], [480, 34], [485, 34], [491, 31]);
  pool('race', 458, 495, 35, LW3.race.hi);
  races.push({ id: 'race', x0: LW3.race.x0, x1: LW3.race.x1, dir: -1, carry: LW3.race.carry });

  // ================= 4. THE NET LOFTS (498-545): A14 PLATFORMING; THE SLUICE HOLDS THE SEA OUT OF THE COVE =================
  ground(498, 503, ST); sign(499, 22, LW3_SIGNS.lofts); sluice('bay', 502, 22, LW3.bayHold);
  ground(504, 537, 33); air(519, 522, 33, 34);   /* THE LOFT COVE's bed, and its sump (row 35) */
  for (const [a, top] of [[506, 21], [510, 19], [514, 21], [517, 18], [524, 20], [528, 22], [532, 20]]) ground(a, a + 1, top);   /* barnacled pier stumps (stone, not timber) */
  net(536, 23, 32);   /* the kelp ladder out of the cove on the far side */
  ent('silver', 521, 34);   /* SECRET: on the sump's bed - at low water, with the jellies out */
  coins([507, 20], [511, 18], [515, 20], [518, 17], [525, 19], [529, 21], [533, 19], [519, 34], [522, 34]);
  trap('t2', 526, 19, 'coins', LW3.trap.coins); sign(503, 22, LW3_SIGNS.trap);
  pool('lofts', 504, 535, 35, LW3.bay.hi);
  bites.push({ tide: 'bay', x0: 516, y0: 25, x1: 525, y1: 34, when: 'high', at: 0.5, kind: 'jellies' });
  ground(538, 545, ST); deco(540, 22, 'fishCottage', 0);   /* the ELITE holds this street (gate 545: ELITES shadow row) */

  // ================= 5. THE LOW STREET (546-585): THE AMBUSH =================
  ground(546, 585, 26); sign(547, 25, LW3_SIGNS.low);
  for (const [a, y, n] of [[551, 23, 5], [558, 22, 5], [565, 23, 5], [572, 22, 5], [579, 23, 4]]) plat(a, y, n);   /* the net-drying walks over the low street (rope and net, art owed: not timber) */
  for (const [x, v] of [[552, 1], [563, 0], [574, 1]]) deco(x, 25, 'fishCottage', v);
  prop('smokehouse', 558, 25); prop('gulls', 568, 25); deco(581, 25, 'seaLantern', 1);
  coins([550, 24], [556, 24], [561, 23], [566, 24], [571, 23], [577, 24], [583, 24]);

  // ================= 6. THE PIERS (586-633): THE EXAM =================
  ground(586, 591, ST); sign(587, 22, LW3_SIGNS.piers); sluice('harbour', 590, 22, LW3.harbour.hold);
  ground(592, 620, FL); air(598, 601, FL, 33); air(608, 611, FL, 33); net(592, 23, 30);
  ground(612, 613, 28); bell('harbour', 613, 27);   /* THE BELL ROCK beside the moored boat */
  boat('harbour', 'b4', 615, 619, 30, 25, 40, 'm4'); moors.push({ id: 'm4', x: 620, y: 30, boat: 'b4' }); ent('lw3moor', 620, 30, { id: 'm4' });
  foe('poolcrab', 599, 33, { face: 1 }); foe('poolcrab', 604, 30); foe('poolcrab', 609, 33); foe('poolcrab', 611, 30);
  trap('t3', 609, 28, 'crush');
  coins([594, 30], [596, 30], [603, 29], [606, 29], [614, 30]);
  pool('harbour', 592, 620, 34, LW3.harbour.hi);
  bites.push({ tide: 'harbour', x0: 592, y0: 24, x1: 620, y1: 34, when: 'high', at: 0.6, kind: 'jellies' });
  ground(621, 633, 24);   /* THE PIER HEAD: 64 px over high water (no swimmer climbs it), 24 px over the floating boat's deck */
  deco(626, 23, 'pierPost'); deco(631, 23, 'buoy');

  // ================= 7. THE HEADLAND (634-649): the boss door, under the lighthouse =================
  ground(634, 649, 24); ent('check', LW3.checks[1][0], LW3.checks[1][1]); sign(637, 23, LW3_SIGNS.boss);
  prop('lighthouse', 645, 23);
  ground(648, 649, 27);

  // ================= 8. THE TIDE FLATS (650-705): THE TIDE HERALD =================
  const A = LW3.arena;
  ground(A.wallL, A.wallL, 27); ground(A.x0, A.x1, A.floor);
  for (const [a, b] of A.stones) ground(a, b, 28);   /* three dry stones: the bell's (west), the wheel's (mid-flats), the east one */
  bell('square', 659, 27); sluice('square', 672, 27, LW3.square.hold);   /* 13 tiles apart: in phase two you ring the one and run to the other inside his call */
  ent('lw3herald', 676, 30, { face: -1 });
  pool('square', A.x0, A.x1, 33, LW3.square.lo);   /* (the other pools start at their HIGH line: the reach model swims them; the kit sets every line on the first frame) */
  ground(A.wallR, A.wallR + 1, 28); ground(A.wallR + 2, W - 1, 25); ent('gate', A.gate, 24);   /* out of the flats in two 3-row steps */

  /* THE TIDES (src/tide-kit.js; kept under L.lw3Tides, not L.tides: claude/water1's generic wiring steps any L.tides level, and two wirings would step this twice) */
  const tides = [
    { id: 'bay', pools: ['flats', 'lofts'], lo: LW3.bay.lo, hi: LW3.bay.hi, cycle: LW3.bay.cycle, rate: 1, safe: 'low', grace: 6, floats: floats.bay,
      verbs: bells.filter(b => b.tide === 'bay').map(b => ({ t: 'bell', x: b.x, y: b.y })).concat(sluices.filter(s => s.tide === 'bay').map(s => ({ t: 'sluice', x: s.x, y: s.y, hold: s.hold }))),
      floods: [{ x0: 382, y0: 24, x1: 394, y1: 32 }, { x0: 412, y0: 24, x1: 447, y1: 33 }, { x0: 504, y0: 24, x1: 535, y1: 34 }], bites: bites.filter(b => b.tide === 'bay'), foes: { poolcrab: 'low' } },
    { id: 'race', pools: ['race'], lo: LW3.race.lo, hi: LW3.race.hi, cycle: LW3.race.cycle, first: 'high', safe: 'high', grace: 4,
      verbs: sluices.filter(s => s.tide === 'race').map(s => ({ t: 'sluice', x: s.x, y: s.y, hold: s.hold })), floods: [{ x0: 462, y0: 28, x1: 495, y1: 34 }] },
    { id: 'harbour', pools: ['harbour'], lo: LW3.harbour.lo, hi: LW3.harbour.hi, cycle: LW3.harbour.cycle, first: 'high', safe: 'high', grace: 4, floats: floats.harbour,
      verbs: bells.filter(b => b.tide === 'harbour').map(b => ({ t: 'bell', x: b.x, y: b.y })).concat(sluices.filter(s => s.tide === 'harbour').map(s => ({ t: 'sluice', x: s.x, y: s.y, hold: s.hold }))),
      floods: [{ x0: 592, y0: 28, x1: 620, y1: 34 }], bites: bites.filter(b => b.tide === 'harbour'), foes: { poolcrab: 'low' } },
    /* THE TIDE FLATS: a cycle the Herald's fight takes over (src/tide-herald.js through the hands); low and dry until he wakes */
    { id: 'square', pools: ['square'], lo: LW3.square.lo, hi: LW3.square.hi, cycle: LW3.square.cycle, first: 'low', firstT: 9999, safe: 'low', grace: 4, boss: true,
      verbs: [{ t: 'bell', x: 659, y: 27 }, { t: 'sluice', x: 672, y: 27, hold: LW3.square.hold }] },
  ];
  /* bay's floats stand in their own coves' pools (b1 in the cove: the cove is part of the bay's flats pool? no - its own) */
  pool('cove', 382, 394, 33, LW3.bay.hi); tides[0].pools.push('cove');

  const falls = (R.falls || []).filter(f => f.x0 < X0 * TS);
  const calm = (R.calm || []).filter(c => c[0] < X0).concat([[X0, W - 1, 0, H - 1]]);   /* the sprinkler leaves Saltreach alone: every foe in it is placed */
  const out = {
    ...R, W, H, grid, ents, pools, falls, moversExtra: movers, calm,
    bore: { ...R.bore, x1: Math.min(R.bore.x1, X0 * TS) }, fresh: [0, 365], turn: [300, 420],
    music: 'longwater', rule: LW3_RULE, lw3: true, checkRun: 280,   /* two shrines in Saltreach (Daniel: fewer): the auto-placer must not put one back between them */
    lw3Tides: tides, lw3Bells: bells, lw3Sluices: sluices, lw3Traps: traps, lw3Moors: moors, lw3Props: props, lw3Races: races, lw3Boats: Object.values(floats).flat().map(f => ({ ...f, x: f.x0 })),
    rigBands: (R.rigBands || []).concat(rigBands), routeSupports: supports,
    sections: LW3.sections.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''), name, x0, x1 })),
    palette: { ...R.palette, haze: 'rgba(214,226,232,0.16)' },   /* the pale sea-mist (art owed: its own tile kit + lantern amber) */
    weather: (R.weather || []).concat([{ x0: X0 * TS, x1: W * TS, kind: 'mist' }]),
    arena: { x0: A.x0 * TS, x1: (A.x1 + 1) * TS, floor: A.floor * TS, y0: 14 * TS, trigger: A.trigger * TS, wallL: A.wallL, wallR: A.wallR, boss: 'herald', music: 'herald', tint: '#3a8aa0', tintA: 0.08, fx: 'motes',
      stones: A.stones.map(([a, b]) => [a * TS, (b + 1) * TS]), tide: 'square', bellX: 659 * TS + 8, sluiceX: 672 * TS + 8 },
  };
  return out;
}

/* THE TABLES THAT NAME MASTER'S SALTREACH BY COLUMN (src/level.js AMBUSH / ELITES / the dead-end stash, src/variety-pass.js TIDE_CRABS, src/stuck-spots.js STUCK /
   STUCK_SIGNS): with the flag ON their 'longwater' rows are LW3's (a getter, read at build time - so ?lw3=1, the global or LW3=1 all reach them); OFF, master's rows.
   One call from src/level.js, after the tables exist. */
export const LW3_TABLES = {
  AMBUSH: [
    { name: 'THE BORE STONES', row: 28, wallL: 326, wallR: 360, check: false,   /* (brief 10-15: one ambush at the bore stones) the walk-up crowd becomes a held room; the Bore still runs through it */
      waves: [[['tideguard', 333, 28], ['netter', 345, 28], ['tideguard', 352, 28], ['scout', 358, 28]]] },
    { name: 'THE LOW STREET', row: 25, wallL: 549, wallR: 583, check: false,   /* (brief: one in the low street) */
      waves: [[['tideguard', 578, 25], ['merrowspear', 557], ['netter', 570], ['scout', 575]]] },
  ],
  ELITES: [['tideguard', 541, 22, { gate: 545 }]],
  TIDE_CRABS: { swap: { crab: { skin: 'tidecrab', every: 1 } }, add: [] },
  STUCK: [
    { id: 'lw-bore-gate', zone: [318, 0, 361, 28], at: [362, 22], glint: 'stall', line: 'THE SEA GATE LIFTS AS THE BORE GOES BY: STAND ON A STONE' },
    { id: 'lw3-cove', zone: [370, 0, 394, 33], at: [380, 22], glint: 'stall', line: 'THE COVE: RING THE SEA BELL AND THE BOAT FLOATS UP' },
    { id: 'lw3-wall', zone: [412, 0, 447, 33], at: [410, 22], glint: 'stall', line: 'THE SEA WALL WANTS HIGH WATER: RING THE BELL ON THE STREET' },
    { id: 'lw3-race', zone: [456, 0, 489, 35], at: [460, 27], glint: 'stall', line: 'THE RACE RUNS UNDER THE MILL: TURN THE SLUICE WHEEL AND WALK THE BED' },
    { id: 'lw3-piers', zone: [586, 0, 620, 34], at: [590, 22], glint: 'stall', line: 'TURN THE SLUICE, CUT THE BOAT LOOSE, RING THE BELL ON THE ROCK' },
  ],
  STUCK_SIGNS: { fix: [{ x: 321, text: 'THE BORE STONES. STAND ON ONE AND LET THE SEA GO UNDER YOU. THE SEA GATE LIFTS BEHIND IT.' }], add: [] },
  STASH: 'seaChest',
};
export function shadowLongwater(tables) {
  for (const [name, tb] of Object.entries(tables)) {
    if (!tb || !(name in LW3_TABLES)) continue;
    const master = tb.longwater;
    try { Object.defineProperty(tb, 'longwater', { configurable: true, enumerable: true, get: () => (lw3On() ? LW3_TABLES[name] : master), set: v => { tb.__lwMaster = v; } }); } catch { /* frozen: leave it */ }
  }
}

/* THE LEVEL'S OWN CHECKS (tools/longwater3.mjs): every bell/sluice above its tide's high water and standing on rock; every trap over open air with a floor under it;
   every boat's mooring beside it; the master columns kept; two shrines in the tail; no goblin kind in the tail. -> [problems] */
export function lintLongWater3(L, T) {
  const bad = [], at = (x, y) => L.grid[y * L.W + x];
  const tide = id => L.lw3Tides.find(t => t.id === id);
  for (const v of [...L.lw3Bells, ...L.lw3Sluices]) { const t = tide(v.tide); if (!t) { bad.push('verb at ' + v.x + ' names no tide ' + v.tide); continue; }
    if (v.y + 1 > t.hi) bad.push('verb at ' + v.x + ',' + v.y + ' drowns at ' + v.tide + ' high water'); if (at(v.x, v.y + 1) !== T.SOLID) bad.push('verb at ' + v.x + ',' + v.y + ' stands on nothing'); if (at(v.x, v.y) !== T.AIR) bad.push('verb at ' + v.x + ',' + v.y + ' is buried'); }
  for (const p of L.lw3Traps) { let y = p.y; while (y < L.H - 1 && at(p.x, y + 1) === T.AIR) y++; if (y - p.y < 2) bad.push('trap ' + p.id + ' has no drop under it'); if (y >= L.H - 2) bad.push('trap ' + p.id + ' falls out of the level'); }
  for (const m of L.lw3Moors) { const b = L.moversExtra.find(q => q.fid === m.boat); if (!b) bad.push('mooring ' + m.id + ' has no boat'); else if (Math.abs(m.x * 16 - (b.x0 + b.w)) > 32) bad.push('mooring ' + m.id + ' is not beside its boat'); }
  const tailChecks = L.ents.filter(e => e.t === 'check' && e.x >= LW3.X0).length; if (tailChecks !== 2) bad.push('Saltreach has ' + tailChecks + ' shrines (want 2: fewer, Daniel)');
  const gob = L.ents.filter(e => e.x >= LW3.X0 && /gob|goblin/i.test(e.t + ' ' + (e.kind || '') + ' ' + (e.skin || ''))); if (gob.length) bad.push('goblin kinds in Saltreach: ' + gob.map(e => e.t).join(','));
  if (L.ents.some(e => e.x >= LW3.X0 && e.t === 'deco' && /tribute|driftwood|log/i.test(e.kind || ''))) bad.push('a tribute chest / driftwood / log in Saltreach (theme fit)');
  if (!L.arena || L.arena.boss !== 'herald') bad.push('the arena is not the Herald\'s');
  return bad;
}
