// src/highlines-ext.js - THE HIGH LINES EXTENSION (claude/hlext1 slice 1: the ore line band + the cave apron; claude/hlext2 slice 2: THE DRUM HALL). Pure data + one transform; no painter.
// Plan: scratch/lane-reports/hlcart-plan.md section 2 + lanes 1 and 4, hlswitch-plan.md section 9.
// BEHIND THE FLAG HL_EXT (src/highlines.js, default OFF, ?hlext=1 preview): with it off none of this runs and the live level is byte-identical (tools/hl-ext.mjs proves it).
// HL_EXT IMPLIES THE SWITCH RULE (HL_SWITCH): the Drum Hall's route board is a HLSWITCH lever, so the extended data is the switch-patched copy (HL_DATA_SW), shifted.
//
// WHAT THE FLAG ADDS (greybox: art owed):
//   THE ORE LINE   26 new rows between JUNCTIONS and THE WIND GORGE: the future cart ride's band - three stations and three PROVISIONAL grip-winch legs (OL1-OL3, tagged cartLeg; the cart lane swaps them), one crossbowman.
//   THE DRUM HALL  48 new rows between THE GONDOLA and THE EXAM (claude/hlext2). The gondola set piece (GD, LO, its station, the dock, the counterweight pair and everything under them) moves DOWN 48 rows; the
//                  exam stays; the rock hall (x 1-66, rows 101-140: a cavity x 5-62, rows 104-136, on the east cliff above the dock) sits in the rows that opens up, its top adit on E1's old foot (the HX deck: E1, the cutter's
//                  race, still starts there). The way in: from THE DOCK two winches up the east strip (DW1 -> M -> DW2), a hall floor HF. THE ROUTE BOARD: one 3-state lever JB on the rail head RH sets three points on the
//                  ceiling rail CR (a held glide, parked until a blow): state 0 -> B1 -> T1 (far west gallery), 1 -> B2 -> T2 (the middle one), 2 -> B3 -> T3 (the east gallery by the exit). The gallery T1 - T2 - T3 is three decks
//                  at one height joined by two HANGING CATWALKS (C1, C2: one drum turns both: rest 5 s, told 1.4 s, swing 3.2 s), so the far states cross more catwalks; T3 -> HW3 (a winch) -> the exit adit HX -> E1 -> the exam.
//                  Foes (all existing): a Hookjack on HW1 (the climb to the rail), a Hookjack on HW3 (the last winch), a saw rigger at the door (cutter on DW2's high end, a race), a crossbowman on T3. A side winch SR from T1 to a silver ledge.
//   THE CAVE APRON 10 new rows between THE EXAM and THE CAVE MOUTH LEDGE: E3 tops onto a rock foot, four long rock steps climb to checkpoint 3's ledge under told rockfall; one gale harpy.
// ROW SHIFT (shiftRows): rows at/below APRON_AT move down 10, at/below HALL_AT move down 48 more (and the gondola group, whose rows 85-104 overlap the exam's), at/below ORE_AT 26 more, so every row ABOVE the apron (the
//   cave mouth, SKYHOOK's arena rows 30-48) keeps its number. Two rope ends sit one row ABOVE a deck of the other side of a cut and are pinned to their other end's side (W4.b tops onto L5; E3.b tops onto the apron foot): see PIN.
//   New landings are APPENDED to the landing list (the switch patch's LE is index 37; ore 38-40, apron 41-45, hall 46-53), so every existing landing index (ROCK_LANDINGS, the art's tables) keeps its meaning.
export const EXT = { oreAt: 189, oreRows: 26, apronAt: 59, apronRows: 10, hallAt: 105, hallRows: 48 };
export const EXT_ROWS = EXT.oreRows + EXT.apronRows + EXT.hallRows;
/* how far a (non-gondola) base row moves down: the apron's rows, the hall's, the ore line's */
export const dRow = y => (y >= EXT.apronAt ? EXT.apronRows : 0) + (y >= EXT.hallAt ? EXT.hallRows : 0) + (y >= EXT.oreAt ? EXT.oreRows : 0);
export const rowMap = y => y + dRow(y);
/* THE GONDOLA GROUP: the set piece whose base rows (85-105) share rows with the exam's foot (E1, L16, the lee): it moves with everything below the hall's cut though its rows are above it */
export const dRowG = y => dRow(y) + (y < EXT.hallAt ? EXT.hallRows : 0);
export const rowMapG = y => y + dRowG(y);
export const G_LANDINGS = [23, 24, 26];   /* the gondola station (the cage's top stop), LA1 (weight A's top stop), THE DOCK */
export const G_LINES = ['GD', 'LO'];
export const isGondolaEnt = e => e.t !== 'hookjack' && e.y >= 85 && e.y < 105 && e.x < 63;   /* the gondola's sign, harpy and crossbowman (base rows): the exam's own (x >= 63, or above row 85) stay */
/* a rope end that tops onto a deck takes its OTHER end's shift (its own row sits on the wrong side of the cut by one) */
export const PIN = { W4: 'b', E3: 'b' };   /* line id -> the end that takes the other end's shift */
const O = y => y + EXT.hallRows;   /* the ore line's rows, as hlext1 wrote them, in the extended level (the hall opened above them) */

/* the landing indexes of what the flag adds (the base is the switch-patched data: 38 landings) */
export const I = { OE: 38, OW: 39, OT: 40, AF: 41, A: 42, B: 43, C: 44, D: 45, HF: 46, M: 47, RH: 48, T1: 49, T2: 50, T3: 51, HX: 52, SL: 53 };
export const EXT_ROCK = [I.AF, I.A, I.B, I.C, I.D];   /* the landing indices that are rock lips (the rest are iron stations) */
export const HALL = { rock: [1, 101, 66, 140], cavity: [5, 104, 62, 136], doors: [[63, 110, 66, 117], [63, 134, 66, 136]], floorRow: 137 };

/* what the flag adds, in EXTENDED rows [x0, top, x1, bottom] / [tx, ty] */
export const EXT_ADD = {
  landings: [
    [58, O(217), 72, O(218)],   // 38 OE  THE ORE LINE's east station (the crossbowman's, leg 1 tops here, leg 2 starts)
    [4, O(209), 16, O(210)],    // 39 OW  its west station (leg 2 tops here, leg 3 starts)
    [24, O(199), 44, O(200)],   // 40 OT  its head station: the old L5 spot under W5's foot (leg 3 tops here); 21 wide so S4's tall pylon (the silver-two side winch) still reaches a deck within SUP.TALL
    [1, 68, 15, 69],            // 41 AF  THE CAVE APRON's foot (a rock ledge: E3 tops here)
    [16, 66, 22, 67],           // 42 A   the long rock steps (7 tiles each, 2 rows apart, the crevice's pattern)
    [9, 64, 15, 65],            // 43 B
    [16, 62, 22, 63],           // 44 C
    [9, 60, 15, 61],            // 45 D   steps up onto L29, checkpoint 3's ledge (row 58)
    /* THE DRUM HALL (greybox) */
    [5, 137, 78, 138],          // 46 HF  the hall floor: rock inside the hall (x 5-66), a one-way deck on the east strip (x 67-78: DW2 tops here)
    [68, 149, 78, 150],         // 47 M   the east strip's mid station (DW1 tops here, DW2 starts)
    [6, 110, 19, 111],          // 48 RH  the rail head, high in the west: HW1 tops here, the ROUTE BOARD lever stands on it, the ceiling rail CR starts over it
    [32, 124, 37, 125],         // 49 T1  the far west gallery (state 0's branch B1 ends over it; the silver winch SR starts here)
    [44, 124, 49, 125],         // 50 T2  the middle gallery (state 1's branch B2)
    [56, 124, 62, 125],         // 51 T3  the east gallery (state 2's branch B3; HW3 starts here; the crossbowman)
    [63, 114, 72, 115],         // 52 HX  the top adit, on E1's old foot (E1 starts here, the exam's race)
    [5, 114, 11, 115],          // 53 SL  the silver ledge (the secret winch SR tops here)
  ],
  lines: [
    /* THE ORE LINE's provisional legs (the cart replaces them): a winch's low end is 1 row over its deck, its high end 2 rows over the next */
    { id: 'OL1', kind: 'winch', a: [33, O(224)], b: [62, O(215)], cartLeg: 1 },   /* S0 (L5, row 225) -> OE (217) */
    { id: 'OL2', kind: 'winch', a: [60, O(216)], b: [12, O(207)], cartLeg: 2 },   /* OE -> OW (209) */
    { id: 'OL3', kind: 'winch', a: [8, O(208)], b: [24, O(198)], cartLeg: 3 },    /* OW -> OT (199): tops under W5's foot */
    /* THE DRUM HALL: the way in (from THE DOCK, two winches up the east strip), the climb to the rail head, the ceiling rail with its three points and three branches, the last winch to the exit adit, the silver side winch */
    { id: 'DW1', purpose: true, kind: 'winch', a: [67, 161], b: [78, 147] },                                   /* the dock (162) -> M (149) */
    { id: 'DW2', purpose: true, kind: 'winch', a: [68, 148], b: [78, 135], cut: true },                        /* M -> the hall floor (137): the rigger at the door saws it - a race, the ride is ~1.3 s */
    { id: 'HW1', purpose: true, kind: 'winch', a: [27, 136], b: [8, 108] },                                    /* the floor -> the rail head RH (110): a Hookjack rides down it */
    { id: 'CR', purpose: true, kind: 'glide', a: [12, 109], b: [60, 114], hold: true,                          /* THE CEILING RAIL: parked until one blow; the three points read the ROUTE BOARD (JB) */
      points: [{ at: 26, to: 'B1', sw: 'JB', on: 0 }, { at: 33, to: 'B2', sw: 'JB', on: 1 }, { at: 40, to: 'B3', sw: 'JB', on: 2 }] },
    { id: 'B1', purpose: true, kind: 'glide', a: [25, 109.0649], b: [35, 123] },                                /* JB = 0: down to T1 (the far gallery: two catwalks to the exit) */
    { id: 'B2', purpose: true, kind: 'glide', a: [32, 110.2803], b: [46, 123] },                                /* JB = 1: down to T2 (one catwalk) */
    { id: 'B3', purpose: true, kind: 'glide', a: [39, 111.3868], b: [61, 123] },                                /* JB = 2: down to T3 (none) */
    { id: 'HW3', purpose: true, kind: 'winch', a: [58, 123], b: [66, 112] },                                    /* T3 -> the exit adit HX (114), through the east wall's doorway: a Hookjack rides down it */
    { id: 'SR', purpose: true, kind: 'winch', a: [33, 123], b: [8, 112], secret: true },                        /* T1 -> the silver ledge SL (the hall's side rail) */
  ],
  switches: [{ id: 'JB', at: [18, 109], states: 3, init: 0, from: 'foot', spring: 0, tag: 'amber' }],   /* THE ROUTE BOARD: three states, one lever on the rail head (standing on RH) */
  catwalks: [
    { id: 'C1', x: 41, top: 124, w: 3, arm: 16, amp: 1.4, period: 2.8, rest: 5, told: 1.4, swing: 3.2 },   /* T1 (right edge 38) - C1 (39.5-42.5) - T2 (44): a gap of 1.5 each side, the sway 1.4 */
    { id: 'C2', x: 53, top: 124, w: 3, arm: 16, amp: 1.4, period: 2.8, rest: 5, told: 1.4, swing: 3.2 },   /* T2 (right edge 50) - C2 (51.5-54.5) - T3 (56) */
  ],
  hookjacks: [{ line: 'HW1', x: 14, dir: 1 }, { line: 'HW3', x: 62, dir: -1 }, { line: 'DW2', x: 77, role: 'cutter' }],
  secrets: [[8, 113]],
};
/* CHECKPOINT 2 MOVES (checkpoint-gaps: the ore line adds 51 route tiles, so L8 would stand 211 from the start): onto L7's east end, the foot of W6 */
export const EXT_CHECK2 = { x: 77, y: rowMap(184) };
export const EXT_SHRINES = [{ x: 62, y: 137 }];   /* THE HALL'S ONE SHRINE (the plan allows one, only if checkpoint-gaps forces it: without it the route from shrine 2 to shrine 3 is 336 tiles): inside the hall by the door (route 181 from shrine 2, 155 to shrine 3) */   /* shrines the hall adds (in route order, before shrine 3): see checkpoint-gaps (the plan allows one, only if the gaps force it) */
export const SECTIONS_EXT = [['FOOTHOLD', 290, 324], ['JUNCTIONS', 273, 290], ['THE ORE LINE', 246, 273], ['THE WIND GORGE', 222, 246], ['THE AMBUSH', 191, 229], ['THE LEE HUT', 176, 192], ['THE COUNTERWEIGHT', 160, 176],
  ['THE GONDOLA', 143, 160], ['THE DRUM HALL', 101, 143], ['THE EXAM', 67, 114], ['THE CAVE APRON', 58, 68], ['THE CAVE MOUTH', 30, 58]];

const clone = o => JSON.parse(JSON.stringify(o));
/* THE HELPER: the base data (HL_DATA_SW) with its rows shifted and the extension added. Pure: the base is never touched. */
export function shiftRows(base) {
  const D = clone(base), mv = ([x0, top, x1, bot], g) => { const d = g ? dRowG(top) : dRow(top); return [x0, top + d, x1, bot + d]; };
  D.h = base.h + EXT_ROWS; D.ext = true;
  D.landings = D.landings.map((b, i) => mv(b, G_LANDINGS.includes(i))).concat(clone(EXT_ADD.landings));
  D.nets = D.nets.map(b => mv(b));
  D.checkpoints = D.checkpoints.map((c, i) => (i === 1 ? { ...EXT_CHECK2 } : { ...c, y: rowMap(c.y) })).concat(clone(EXT_SHRINES)).sort((p, q) => q.y - p.y);   /* route order: bottom to top */
  D.secrets = D.secrets.map(([x, y]) => [x, rowMap(y)]).concat(clone(EXT_ADD.secrets));
  D.exit = [D.exit[0], rowMap(D.exit[1]), D.exit[2], rowMap(D.exit[3])];
  const K = D.lineKit, gl = new Set(G_LINES);
  K.anchors = K.anchors.map(([x, y]) => [x, y >= 85 && y < 105 ? rowMapG(y) : rowMap(y)]);   /* the two gondola anchors (37, 97.5) and (59, 85) travel with their lines */
  K.lines = K.lines.map(d => { const o = { ...d }, pin = PIN[d.id], ya = d.a[1], yb = d.b[1], g = gl.has(d.id), m = g ? rowMapG : rowMap;
    if (g) { o.a = [d.a[0], m(ya)]; o.b = [d.b[0], m(yb)]; return o; }
    const da = dRow(ya), db = pin === 'b' ? dRow(ya) : dRow(yb);   /* a pinned end b takes a's shift */
    o.a = [d.a[0], ya + da]; o.b = [d.b[0], yb + db]; return o; }).concat(clone(EXT_ADD.lines));
  K.weights = K.weights.map(w => { const dt = dRowG(w.a.top), o = { ...w, a: { ...w.a, top: w.a.top + dt, bot: w.a.bot + dt }, b: { ...w.b, top: w.b.top + dt, bot: w.b.bot + dt } };   /* the counterweight pair stands under the gondola: it travels with it */
    if (w.hopper) o.hopper = [w.hopper[0], w.hopper[1] + dt]; if (w.brake) o.brake = [w.brake[0], w.brake[1] + dt]; return o; });
  const box = ([x0, y0, x1, y1]) => { const d = dRow(y0); return [x0, y0 + d, x1, y1 + d]; };   /* a box moves rigidly with its top row */
  K.winds = K.winds.map(w => ({ ...w, box: box(w.box) }));
  K.lee = K.lee.map(box);
  K.switches = (K.switches || []).map(s => ({ ...s, at: [s.at[0], rowMap(s.at[1])] })).concat(clone(EXT_ADD.switches));
  K.catwalks = clone(EXT_ADD.catwalks);
  D.hookjacks = D.hookjacks.concat(clone(EXT_ADD.hookjacks));
  /* the arena lives above every cut: it must not move (the head station's pixels are derived from it) */
  if (base.arena.floor >= EXT.apronAt || base.arena.swingY >= EXT.apronAt) throw new Error('highlines-ext: the arena is below the first cut');
  return D;
}

/* THE EXTENDED LEVEL: the flag-off (switch-patched) builder's result with its rows moved and the extension placed. ctx = what highlines.js owns (no import back: no cycle) */
export function extendHighLines(B, ctx) {
  const { T, TS, DX, hlSupports, endSupports, ROCK_LANDINGS } = ctx, W = B.W, H = B.H + EXT_ROWS;
  const grid = new Uint8Array(W * H);
  const cuts = [[EXT.apronAt, EXT.apronRows], [EXT.hallAt, EXT.hallRows], [EXT.oreAt, EXT.oreRows]];
  const src = y => { let sh = 0; for (const [r, n] of cuts) { const start = r + sh; if (y < start) return y - sh; if (y < start + n) return -1; sh += n; } return y - sh; };
  for (let y = 0; y < H; y++) { const s = src(y); if (s >= 0) grid.set(B.grid.subarray(s * W, (s + 1) * W), y * W); else { grid[y * W] = T.SOLID; grid[y * W + W - 1] = T.SOLID; } }   /* the new rows are the shaft: the two cliff walls and air */
  const put = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  /* the gondola group's old decks leave their rows (the dock's deck stays: the exit adit HX is on the very spot) */
  const baseL = [[13, 102, 25], [1, 102, 2]];   /* base rows of the station and LA1 (their decks are one-way rows) */
  for (const [x0, top, x1] of baseL) for (let x = x0; x <= x1; x++) put(x, rowMap(top), T.AIR);
  /* THE DRUM HALL's rock: a mass on the east cliff, the cavity, the two doors, the floor */
  { const [rx0, ry0, rx1, ry1] = HALL.rock, [cx0, cy0, cx1, cy1] = HALL.cavity;
    for (let y = ry0; y <= ry1; y++) for (let x = rx0; x <= rx1; x++) put(x, y, T.SOLID);
    for (let y = cy0; y <= cy1; y++) for (let x = cx0; x <= cx1; x++) put(x, y, T.AIR);
    for (const [x0, y0, x1, y1] of HALL.doors) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, T.AIR);
  }
  for (const [x0, top, x1] of EXT_ADD.landings) for (let x = x0; x <= x1; x++) put(x, top, T.ONEWAY);   /* every new deck (after the rock: the exit adit's deck HX runs through the east wall) */
  for (const i of G_LANDINGS) { const [x0, top, x1] = DX.landings[i]; for (let x = x0; x <= x1; x++) put(x, top, T.ONEWAY); }   /* the gondola group's decks, at their new rows */
  for (let x = 5; x <= 66; x++) put(x, HALL.floorRow, T.SOLID);   /* the hall floor is rock inside the hall; the strip beyond (67-78) stays the one-way deck */
  const ents = B.ents.filter(e => e.t !== 'check').map(e => ({ ...e, y: (isGondolaEnt(e) ? rowMapG : rowMap)(e.y) }));   /* the shrines are re-placed from the (moved) data below */
  const ent = (t, x, y, o = {}) => ents.push({ t, x, y, ...o });
  const lineAt = (id, tx) => { const d = DX.lineKit.lines.find(q => q.id === id), k = (tx - d.a[0]) / (d.b[0] - d.a[0]); return d.a[1] + (d.b[1] - d.a[1]) * k; };
  const coinOn = (id, tx) => ent('coin', tx, Math.floor(lineAt(id, tx)));
  for (const c of DX.checkpoints) ent('check', c.x, c.y - 1);
  /* ---- THE ORE LINE ---- */
  ent('sign', 26, O(224), { text: 'THE ORE LINE: THREE LEGS UP. STRIKE ONCE ON EACH.' });
  ent('crossbow', 62, O(216), { face: -1 });                       /* the plan's one existing foe: he leads you up leg 1 from the east station */
  coinOn('OL1', 45); coinOn('OL2', 36); coinOn('OL3', 16);
  /* ---- THE DRUM HALL ---- */
  ent('sign', 70, 148, { text: 'THE DRUM HALL IS ABOVE. THE RIGGER SAWS THE DOOR LINE: STRIKE.' });
  ent('sign', 9, 109, { text: 'THE ROUTE BOARD. THE LEVER SETS THE RAIL: READ THE LAMPS.' });
  ent('sign', 33, 123, { text: 'THE DRUM TURNS AND THE CATWALKS SWING. CROSS WHEN THEY STILL.' });
  ent('crossbow', 60, 123, { face: -1 });                          /* the plan's one crossbowman: on the east gallery, over both catwalks */
  ent('silver', 8, 113);
  ent('hllever', 18, 109, { sw: 'JB', from: 'foot', tag: 'amber' });
  for (const hj of EXT_ADD.hookjacks) { const d = DX.lineKit.lines.find(q => q.id === hj.line), k = (hj.x - d.a[0]) / (d.b[0] - d.a[0]), ly = d.a[1] + (d.b[1] - d.a[1]) * k;
    const land = hj.role === 'cutter' ? DX.landings.find(b => hj.x >= b[0] && hj.x <= b[2] && b[1] >= ly && b[1] - ly <= 3) : null;
    ent('hookjack', hj.x, land ? land[1] - 1 : Math.floor(ly), { line: hj.line, role: hj.role, dir: hj.dir }); }
  coinOn('DW2', 73); coinOn('HW1', 17); coinOn('B1', 30); coinOn('B2', 40); coinOn('B3', 50); ent('coin', 46, 123); ent('coin', 59, 123); coinOn('HW3', 61);
  /* ---- THE CAVE APRON ---- */
  ent('sign', 3, 67, { text: 'LOOSE ROCK: DUST FIRST, THEN IT FALLS.' });
  ent('galeharpy', 28, 62, { face: -1 });                          /* the one gale harpy (existing) */
  for (const [x, ev] of [[18, 2.8], [21, 3.1]]) ent('rockfall', x, 50, { every: ev, tell: 1.0, seen: true });   /* told, on screen, over the A / C steps only (never over the shrine ledge) */
  for (const [cx, cy] of [[19, 65], [12, 63], [19, 61]]) ent('coin', cx, cy);
  const solidAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? true : grid[y * W + x] === T.SOLID);
  const gm = m => { const d = dRowG(m.y0 / TS) * TS; return { ...m, y: m.y + d, y0: m.y0 + d, y1: m.y1 + d }; };
  const movers = (B.moversExtra || []).map(gm).concat((DX.lineKit.catwalks || []).map(c => ({ kind: 'lift', lk: 'cw:' + c.id, fair: 'lk', x: (c.x - c.w / 2) * TS, y: c.top * TS, w: c.w * TS, h: 6, y0: c.top * TS, y1: c.top * TS, speed: 0 })));
  const K = DX.lineKit, lines = K.lines;
  return { ...B, H, h: H, grid, ents, START: { x: B.START.x, y: rowMap(B.START.y) }, moversExtra: movers,
    routeSupports: hlSupports(DX, (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : grid[y * W + x]), t => t === T.SOLID, ROCK_LANDINGS.concat(EXT_ROCK), [0, I.HF]),
    lineKit: { ...clone(K), ends: endSupports(DX, (x, y) => solidAt(x, y)) }, hookjacks: DX.hookjacks.map(h => ({ ...h })),
    landings: DX.landings.map(b => b.slice()), nets: DX.nets.map(b => b.slice()), checkpoints: DX.checkpoints.map(c => ({ ...c })), secrets: DX.secrets.map(s => s.slice()), exit: DX.exit.slice(),
    calm: [[0, W - 1, 0, H - 1]],
    sections: SECTIONS_EXT.map(([name, y0, y1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, y0, y1, x0: 0, x1: W - 1 })),
    winch: lines.filter(d => d.kind === 'winch').map(d => ({ x: d.a[0], row: Math.round((d.a[1] + d.b[1]) / 2), id: d.id })),
    points: lines.flatMap(d => (d.points || []).map(p => ({ x: p.at, id: d.id, to: p.to, ...(p.sw !== undefined ? { sw: p.sw, on: p.on } : {}) }))),
    lever: K.switches.map(s => ({ x: s.at[0], row: s.at[1], id: s.id, from: s.from })),
    hopper: K.weights.map(w => ({ x: w.hopper[0], row: w.hopper[1], id: w.id })),
    gondola: lines.filter(d => d.cab).map(d => ({ x: d.a[0], row: Math.round(d.a[1]), id: d.id, onto: d.cab.onto })) };
}
