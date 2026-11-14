// src/highlines-ext.js - THE HIGH LINES EXTENSION, slice 1 (claude/hlext1, 11-14; plan scratch/lane-reports/hlcart-plan.md section 2 + lane 1 "HLEXT1"). Pure data + one transform; no painter.
// BEHIND THE FLAG HL_EXT (src/highlines.js, default OFF, ?hlext=1 preview): with it off none of this runs and the live level is byte-identical (tools/hl-ext.mjs proves it).
//
// WHAT THE FLAG ADDS (greybox: art owed):
//   THE ORE LINE   26 new rows between JUNCTIONS and THE WIND GORGE (rows 199-224 in the extended level): the future cart ride's band - three stations and three legs up across the shaft.
//                  The legs are PROVISIONAL grip winches (OL1-OL3, tagged cartLeg): on foot-and-line the band is already a climb the whole hero set can make, so the level never soft-locks
//                  before the cart lane (HLCARTK / HLCARTL) swaps the legs for the cart. One crossbowman on the east station (the plan's one existing foe).
//   THE CAVE APRON 10 new rows between THE EXAM and THE CAVE MOUTH LEDGE (rows 58-68): E3 now tops onto a rock foot, four long rock steps climb to checkpoint 3's ledge under told rockfall; one gale harpy.
// ROW SHIFT (shiftRows): rows at/below ORE_AT move down 26, rows at/below APRON_AT move down 10 (both: +36), so every row ABOVE the apron (the cave mouth, SKYHOOK's arena rows 30-48) keeps its number.
//   Two rope ends sit one row ABOVE a deck of the other side of a cut and are pinned to their other end's side (W4.b tops onto L5; E3.b tops onto the apron foot): see PIN.
//   New landings are APPENDED to the landing list, so every existing landing index (ROCK_LANDINGS, the art's tables) keeps its meaning.
export const EXT = { oreAt: 189, oreRows: 26, apronAt: 59, apronRows: 10 };
export const EXT_ROWS = EXT.oreRows + EXT.apronRows;
/* how far a row moves down: the apron's rows for everything at/below APRON_AT, the ore line's for everything at/below ORE_AT */
export const dRow = y => (y >= EXT.apronAt ? EXT.apronRows : 0) + (y >= EXT.oreAt ? EXT.oreRows : 0);
export const rowMap = y => y + dRow(y);
/* a rope end that tops onto a deck takes its OTHER end's shift (its own row sits on the wrong side of the cut by one) */
export const PIN = { W4: 'b', E3: 'b' };   /* line id -> the end that takes the other end's shift */

/* what the flag adds, in EXTENDED rows [x0, top, x1, bottom] / [tx, ty] */
export const EXT_ADD = {
  landings: [
    [58, 217, 72, 218],   // 37 OE  THE ORE LINE's east station (the crossbowman's, leg 1 tops here, leg 2 starts)
    [4, 209, 16, 210],    // 38 OW  its west station (leg 2 tops here, leg 3 starts)
    [24, 199, 44, 200],   // 39 OT  its head station: the old L5 spot under W5's foot (leg 3 tops here); 21 wide so S4's tall pylon (the silver-two side winch) still reaches a deck within SUP.TALL
    [1, 68, 15, 69],      // 40 AF  THE CAVE APRON's foot (a rock ledge: E3 tops here)
    [16, 66, 22, 67],     // 41 A   the long rock steps (7 tiles each, 2 rows apart, the crevice's pattern)
    [9, 64, 15, 65],      // 42 B
    [16, 62, 22, 63],     // 43 C
    [9, 60, 15, 61],      // 44 D   steps up onto L29, checkpoint 3's ledge (row 58)
  ],
  lines: [
    /* THE ORE LINE's provisional legs (the cart replaces them): a winch's low end is 1 row over its deck, its high end 2 rows over the next */
    { id: 'OL1', kind: 'winch', a: [33, 224], b: [62, 215], cartLeg: 1 },   /* S0 (L5, row 225) -> OE (217) */
    { id: 'OL2', kind: 'winch', a: [60, 216], b: [12, 207], cartLeg: 2 },   /* OE -> OW (209) */
    { id: 'OL3', kind: 'winch', a: [8, 208], b: [24, 198], cartLeg: 3 },    /* OW -> OT (199): tops under W5's foot */
  ],
};
/* CHECKPOINT 2 MOVES (checkpoint-gaps: the ore line adds 51 route tiles, so L8 would stand 211 from the start): onto L7's east end, the foot of W6 (route 195 of 404: 195 back, 200 forward to checkpoint 3; no new shrine) */
export const EXT_CHECK2 = { x: 77, y: 194 };
export const EXT_ROCK = [40, 41, 42, 43, 44];   /* the landing indices that are rock lips (the rest are iron stations) */
export const SECTIONS_EXT = [['FOOTHOLD', 242, 276], ['JUNCTIONS', 225, 242], ['THE ORE LINE', 198, 225], ['THE WIND GORGE', 174, 198], ['THE AMBUSH', 143, 181], ['THE LEE HUT', 128, 144], ['THE COUNTERWEIGHT', 112, 128],
  ['THE GONDOLA', 95, 112], ['THE EXAM', 67, 114], ['THE CAVE APRON', 58, 68], ['THE CAVE MOUTH', 30, 58]];

const clone = o => JSON.parse(JSON.stringify(o));
/* THE HELPER: the base data (HL_DATA) with its rows shifted and the extension added. Pure: the base is never touched. */
export function shiftRows(base) {
  const D = clone(base), mv = ([x0, top, x1, bot]) => { const d = dRow(top); return [x0, top + d, x1, bot + d]; };
  D.h = base.h + EXT_ROWS; D.ext = true;
  D.landings = D.landings.map(mv).concat(clone(EXT_ADD.landings));
  D.nets = D.nets.map(mv);
  D.checkpoints = D.checkpoints.map((c, i) => (i === 1 ? { ...EXT_CHECK2 } : { ...c, y: rowMap(c.y) }));
  D.secrets = D.secrets.map(([x, y]) => [x, rowMap(y)]);
  D.exit = [D.exit[0], rowMap(D.exit[1]), D.exit[2], rowMap(D.exit[3])];
  const K = D.lineKit;
  K.anchors = K.anchors.map(([x, y]) => [x, rowMap(y)]);
  K.lines = K.lines.map(d => { const o = { ...d }, pin = PIN[d.id], ya = d.a[1], yb = d.b[1];
    const da = pin === 'b' ? dRow(ya) : dRow(ya), db = pin === 'b' ? dRow(ya) : dRow(yb);   /* a pinned end b takes a's shift */
    o.a = [d.a[0], ya + da]; o.b = [d.b[0], yb + db]; return o; }).concat(clone(EXT_ADD.lines));
  K.weights = K.weights.map(w => { const dt = dRow(w.a.top), o = { ...w, a: { ...w.a, top: w.a.top + dt, bot: w.a.bot + dt }, b: { ...w.b, top: w.b.top + dt, bot: w.b.bot + dt } };
    if (w.hopper) o.hopper = [w.hopper[0], w.hopper[1] + dt]; if (w.brake) o.brake = [w.brake[0], w.brake[1] + dt]; return o; });
  const box = ([x0, y0, x1, y1]) => { const d = dRow(y0); return [x0, y0 + d, x1, y1 + d]; };   /* a box moves rigidly with its top row */
  K.winds = K.winds.map(w => ({ ...w, box: box(w.box) }));
  K.lee = K.lee.map(box);
  /* the arena lives above every cut: it must not move (the head station's pixels are derived from it) */
  if (base.arena.floor >= EXT.apronAt || base.arena.swingY >= EXT.apronAt) throw new Error('highlines-ext: the arena is below the first cut');
  return D;
}

/* THE EXTENDED LEVEL: the flag-off builder's result with its rows moved and the extension placed. ctx = what highlines.js owns (no import back: no cycle) */
export function extendHighLines(B, ctx) {
  const { T, TS, DX, hlSupports, endSupports, ROCK_LANDINGS } = ctx, W = B.W, H = B.H + EXT_ROWS;
  const grid = new Uint8Array(W * H);
  const src = y => (y <= EXT.apronAt - 1 ? y : y < EXT.apronAt + EXT.apronRows ? -1 : y < EXT.oreAt + EXT.apronRows ? y - EXT.apronRows : y < EXT.oreAt + EXT.apronRows + EXT.oreRows ? -1 : y - EXT_ROWS);
  for (let y = 0; y < H; y++) { const s = src(y); if (s >= 0) grid.set(B.grid.subarray(s * W, (s + 1) * W), y * W); else { grid[y * W] = T.SOLID; grid[y * W + W - 1] = T.SOLID; } }   /* the new rows are the shaft: the two cliff walls and air */
  const put = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  for (const [x0, top, x1] of EXT_ADD.landings) for (let x = x0; x <= x1; x++) put(x, top, T.ONEWAY);
  const ents = B.ents.filter(e => e.t !== 'check').map(e => ({ ...e, y: rowMap(e.y) }));   /* the shrines are re-placed from the (moved) data below */
  const ent = (t, x, y, o = {}) => ents.push({ t, x, y, ...o });
  const lineAt = (id, tx) => { const d = DX.lineKit.lines.find(q => q.id === id), k = (tx - d.a[0]) / (d.b[0] - d.a[0]); return d.a[1] + (d.b[1] - d.a[1]) * k; };
  const coinOn = (id, tx) => ent('coin', tx, Math.floor(lineAt(id, tx)));
  for (const c of DX.checkpoints) ent('check', c.x, c.y - 1);
  /* ---- THE ORE LINE ---- */
  ent('sign', 26, 224, { text: 'THE ORE LINE: THREE LEGS UP. HANG ON AND STRIKE.' });
  ent('crossbow', 62, 216, { face: -1 });                          /* the plan's one existing foe: he leads you up leg 1 from the east station */
  coinOn('OL1', 45); coinOn('OL2', 36); coinOn('OL3', 16);
  /* ---- THE CAVE APRON ---- */
  ent('sign', 3, 67, { text: 'LOOSE ROCK: DUST FIRST, THEN IT FALLS.' });
  ent('galeharpy', 28, 62, { face: -1 });                          /* the one gale harpy (existing) */
  for (const [x, ev] of [[18, 2.8], [21, 3.1]]) ent('rockfall', x, 50, { every: ev, tell: 1.0, seen: true });   /* told, on screen, over the A / C steps only (never over the shrine ledge) */
  for (const [cx, cy] of [[19, 65], [12, 63], [19, 61]]) ent('coin', cx, cy);
  const solidAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? true : grid[y * W + x] === T.SOLID);
  const movers = (B.moversExtra || []).map(m => { const d = dRow(m.y0 / TS) * TS; return { ...m, y: m.y + d, y0: m.y0 + d, y1: m.y1 + d }; });
  const K = DX.lineKit, lines = K.lines;
  return { ...B, H, h: H, grid, ents, START: { x: B.START.x, y: rowMap(B.START.y) }, moversExtra: movers,
    routeSupports: hlSupports(DX, (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : grid[y * W + x]), t => t === T.SOLID, ROCK_LANDINGS.concat(EXT_ROCK)),
    lineKit: { ...clone(K), ends: endSupports(DX, (x, y) => solidAt(x, y)) }, hookjacks: DX.hookjacks.map(h => ({ ...h })),
    landings: DX.landings.map(b => b.slice()), nets: DX.nets.map(b => b.slice()), checkpoints: DX.checkpoints.map(c => ({ ...c })), secrets: DX.secrets.map(s => s.slice()), exit: DX.exit.slice(),
    calm: [[0, W - 1, 0, H - 1]],
    sections: SECTIONS_EXT.map(([name, y0, y1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, y0, y1, x0: 0, x1: W - 1 })),
    winch: lines.filter(d => d.kind === 'winch').map(d => ({ x: d.a[0], row: Math.round((d.a[1] + d.b[1]) / 2), id: d.id })),
    points: lines.flatMap(d => (d.points || []).map(p => ({ x: p.at, id: d.id, to: p.to }))),
    hopper: K.weights.map(w => ({ x: w.hopper[0], row: w.hopper[1], id: w.id })),
    gondola: lines.filter(d => d.cab).map(d => ({ x: d.a[0], row: Math.round(d.a[1]), id: d.id, onto: d.cab.onto })) };
}
