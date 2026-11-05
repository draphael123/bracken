/* src/monastery3.js - THE MONASTERY 3: rows 59-217 laid again as rooms of a goblin-held monastery (claude/monastery3-1105, brief
   scratch/brief-monastery3-1116.md + Daniel 11-02 15:55 / 15:58). BEHIND A FLAG: src/mon3-flag.js MON3 (false on master, ?mon3=1 in the
   page, MON3=1 for a Node tool), so master keeps playing the old layout until this one is proven and arted.

   WHAT IT KEEPS. The old build (theMonastery in src/level.js) is built first and everything from row 58 UP is kept as it is - the False
   Abbot's ringing floor and its house (rows 14-31), the crawl and the last wheel (32-38), the guardian's hall (39-55) and its floor (56-58) -
   so the boss and the mini fight in exactly the rooms their own code knows. Two edits up there: the zig-zag plank stair from the hall's
   east end to the crawl is a BELL ROPE now, and the birds that were indoors go (birds outside only).

   WHAT IT LAYS (bottom up), one idea per room, wide halls taking turns with tight verticals (Daniel 11-02 15:55 #1-#2):
     THE GATE + THE GARTH       (203-217) the barricaded pilgrims' gate; the garden courtyard is the breather, two root cellars hide a silver each
     THE REFECTORY              (185-199) the goblin FEAST: an ambush on the long tables (the tables are the platforms); the KITCHEN at its west end
     THE KITCHEN FLUE           (166-199) tight vertical: three of the old braziers breathe up the chimney, and it turns east (the L) into...
     THE SCRIPTORIUM            (166-181) candle-dark: the desks' candles are the light, and the snuffers put them out (the room dims)
     THE CELLS                  (163-181) tight vertical: a corridor of monks' cells stacked up the east wall, cots and loot in them
     THE DORTER                 (149-162) the goblin camp in the monks' dormitory: its fire, its looted cots, its sleepers
     THE CLIFF PATH             (119-145) the ONE exterior climb: the monks' path up the outside of the crag, bats in the cave, birds on the wind
     THE BELL TOWERS            (88-118)  outside, above the cloud: strike the bell in the east tower and the DRAWBRIDGE comes down (15:58)
     THE CHAPEL                 (59-87)   the nave and its goblin congregation, a priest leading it; the altar's censer and a prayer wheel up to the loft
   CHECKPOINTS (15:55 #5, Salt & Sanctuary): three - the kitchen, the dorter roof, the crawl door - and two SHORTCUTS unlocked from above:
   a bell at the top whose ROPE unrolls down the monks' rope well along the west wall (the dorter -> the kitchen; the guardian's door -> the
   dorter roof). A bell rope is a tbell with `rope: [x, y0, y1]` (src/main.js lays its NET when struck, and a struck one stays down).
   Every room's art is the old level's own kit (monkTower/monkScript/monkRefectory/... facades and interiors): the look is kept. */

import { layAbbotChapel } from './abbot-chapel.js';   /* (claude/falseabbot) rows 0-31: the rooftop climb, the belfry and the Abbot's chapel */
export function rebuildMonastery3(R, { T, TS }) {
  const W = R.W, H = R.H, g = R.grid, CUT = 58;
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y * W + x] = v; };
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const block = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); };
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const boards = (x, y, n) => { for (let i = 0; i < n; i++) set(x + i, y, T.ONEWAY); };
  const rope = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.NET); };
  const climbFace = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.CLIMB); };
  const ents = [], ent = (t, x, y, o = {}) => ents.push({ t, x, y, ...o }), coins = (...p) => p.forEach(([x, y]) => ent('coin', x, y));
  const deco = (x, y, kind, v = 0, o = {}) => ent('deco', x, y, { kind, v, ...o });
  const movers = [], facades = [], masonry = [], interiors = [], flags = [], hangers = [], crumbles = [], darkZones = [], islands = [];

  /* ---- KEEP rows 0..58 of the old build; drop everything it put below them ---- */
  const above = y => y <= CUT;
  const keepRect = r => r[3] <= CUT, clipRect = r => (r[2] <= CUT && r[3] > CUT) ? [r[0], r[1], r[2], CUT, ...r.slice(4)] : r;
  const BIRDS = new Set(['harpy', 'fledgling', 'bat']);
  for (const e of R.ents) {
    if (!above(e.y)) continue;
    if (BIRDS.has(e.t) && e.y >= 32) continue;                         /* birds outside only (15:55 #1): the crawl and the guardian's hall are indoors */
    if (e.t === 'coin' && e.x >= 57 && e.x <= 84 && e.y >= 38 && e.y <= 54) continue;   /* the zig-zag stair's coins (the stair is a bell rope now) */
    if (e.t === 'check' && e.x === 22 && e.y === 55) continue;         /* ~3 checkpoints (15:55 #5): the guardian's door keeps its bell instead (the shortcut) */
    if (e.x <= 3 && e.y >= 53 && e.y <= 55) continue;                  /* the rope well's mouth */
    ents.push(e);
  }
  for (const m of R.moversExtra || []) if (m.y / TS <= CUT) movers.push(m);
  for (const f of R.facades || []) if (f[2] <= CUT) facades.push(clipRect(f));
  for (const m of R.masonry || []) if (m[2] <= CUT) masonry.push(clipRect(m));
  for (const i of R.interiors || []) if (i[2] <= CUT) interiors.push(clipRect(i));
  for (const c of R.crumbles || []) if (c.row <= CUT) crumbles.push(c);
  for (const h of (R.monk && R.monk.hangers) || []) if (h[2] <= CUT) hangers.push(h);
  for (const f of (R.monk && R.monk.flags) || []) if (Math.max(f[1], f[3]) <= CUT) flags.push(f);

  /* the hall's east end: the zig-zag plank stair up to the crawl becomes THE GREAT BELL'S ROPE (rhythm #1: a tight vertical, not a seventh stair) */
  for (let y = 38; y <= 54; y++) for (let x = 57; x <= 84; x++) if (at(x, y) === T.ONEWAY) set(x, y, T.AIR);
  rope(58, 39, 55); boards(59, 39, 4);                                 /* the rope from the hall floor to a landing three rows under the crawl's trapdoor (52-66 @36) */
  ent('sign', 62, 55, { text: 'THE GREAT BELL\'S ROPE. CLIMB IT TO THE BELFRY CRAWL.' });
  block(84, 86, 56, 58);                                               /* the old side route's trapdoor in the hall floor is shut: the way up is through the guardian's hall */

  /* ---- CLEAR rows 59..217 and lay them again ---- */
  air(1, W - 2, CUT + 1, 217); block(0, 0, 0, H - 1); block(W - 1, W - 1, 0, H - 1);
  block(1, W - 2, 218, H - 1);
  const CLOUD = 117;   /* the sun is on the stone above the cliff path: you come out of the grey at the bell towers */

  // a TRAPDOOR in a slab: boards on its top row, air under them (the jump up through it is legal from three rows under its top)
  const hatch = (x, top, n) => { boards(x, top, n); air(x, x + n - 1, top + 1, top + 2); };
  // THE INCENSE (the old level's own rule): a brazier on `row`'s floor lifts you `rise` rows and two more; its ledge is `row - rise`, one tile clear of the column
  const brazier = (x, row, rise, o = {}) => ent('vent', x, row - 1, { heat: true, incense: true, h: (rise + 2) * TS, period: o.period || 4.2, on: o.on || 2.2, phase: o.phase || 0, lift: o.lift || 190, w: 12, ember: !!o.ember, snuff: !!o.snuff });
  // A PRAYER WHEEL (the old level's own rule): a stair of boards off one pivot, each two up and two across; a blow turns it a quarter about the pivot
  const wheel = (floorRow, px, py, n, start) => {
    const arm = s => { const out = []; for (let k = 1; k <= n; k++) out.push([px + s * 2 * k, py - 2 * k, 3]); return out; };
    const a = arm(1), b = arm(-1); boards(px, py, 3);
    for (const [x, y, w] of (start === 'b' ? b : a)) boards(x, y, w);
    ent('pwheel', px + 1, floorRow, { a, b, st: start === 'b' ? 1 : 0, pivot: [px, py] });
  };
  // A COUNTERWEIGHT (the old book hoist): two baskets on one rope - stand in one and it sinks, and the other comes up past you
  let pairN = 0;
  const pair = (ax, bx, rest, Rr, hubRow) => { const id = 'm3cw' + (pairN++), x0 = Math.min(ax, bx), x1 = Math.max(ax, bx) + 1;
    const band = { x0, x1, y0: rest - Rr, y1: rest + Rr }, hubX = (Math.min(ax, bx) + 2) * TS;
    for (const [role, x] of [['a', ax], ['b', bx]]) movers.push({ kind: 'lift', cw: id, role, x: x * TS, y: rest * TS, y0: rest * TS, y1: (rest + Rr) * TS, yUp: (rest - Rr) * TS, w: 32, h: 8, speed: 36, top: hubRow * TS, hubX, cwBand: band });
  };
  // a TABLE in the refectory: its top a row of boards, its two legs boards down to the floor (a hero walks between them; the legs hold it up)
  const tables = [];
  const table = (x0, x1, top, floor) => { boards(x0, top, x1 - x0 + 1); for (let y = top + 1; y < floor; y++) { set(x0, y, T.ONEWAY); set(x1, y, T.ONEWAY); } tables.push([x0, x1, top, floor]); };
  // a LANTERN on a desk: the scriptorium's candles (snuffers put them out: the room dims). `candle` is for the art pass (drawn as a desk candle)
  const candle = (x, y) => ent('lantern', x, y, { candle: true });

  /* ================= THE GATE + THE GARTH (rows 203-217; the refectory's floor 200-202 over it) ================= */
  block(1, W - 2, 200, 202);
  facades.push([1, 14, 203, 217, 'monkTower', { arch: [211, 217], roof: true }]);
  block(16, 16, 203, 213); masonry.push([16, 16, 203, 213]);          /* the inner gate's wall, and its doorway BARRICADED (15:55 #3): the goblins piled the monks' crates in it - strike them down */
  for (let y = 214; y <= 217; y++) set(16, y, T.CRATE);
  ent('sign', 4, 217, { text: 'THE MONASTERY. GOBLINS DROVE THE MONKS OUT AND BARRED THE DOORS. STRIKE THE BARRICADE DOWN.' });
  deco(9, 217, 'statue', 1, { defaced: true });                       /* the gate's saint, a goblin helmet jammed on his head (art: defaced) */
  deco(12, 217, 'lootHeap', 0); deco(7, 217, 'portcullis', 0);
  ent('sentry', 20, 217, { face: -1 }); ent('rockgoblin', 25, 217, { face: -1 });   /* the barricade's watch */
  // THE GARTH: the garden courtyard, terraces rising east under the open sky - a breather (no foes), the herb beds, the orchard, the skeps
  block(41, 58, 215, 217); block(59, 74, 212, 217); block(75, W - 2, 209, 217);
  masonry.push([41, 58, 215, 217], [59, 74, 212, 217], [75, 94, 209, 217]);
  /* THE GARTH'S PRAYER WHEEL (the old level's first lesson, moved out into the garden): turned to the dovecote; strike it and its stair climbs to the trapdoor */
  wheel(208, 85, 207, 2, 'b'); air(81, 83, 201, 202); coins([82, 202]); masonry.push([80, 84, 200, 200]);   /* its other stair goes up into the dovecote's nook in the refectory's floor */
  ent('sign', 78, 208, { text: 'A PRAYER WHEEL IN THE GARTH. STRIKE IT AND ITS STAIR TURNS. STRIKE IT AGAIN AND IT TURNS BACK.' });
  hatch(89, 200, 5);
  for (const [x, y, k, v] of [[20, 217, 'beanpoles', 0], [30, 217, 'fruitTree', 0], [36, 217, 'herbBed', 0], [44, 214, 'skep', 0], [47, 214, 'skep', 1], [52, 214, 'herbBed', 1],
    [62, 211, 'fruitTree', 1], [70, 211, 'well', 0], [78, 208, 'herbBed', 0], [76, 208, 'fruitTree', 2], [92, 208, 'dovecote', 0]]) deco(x, y, k, v);
  // two ROOT CELLARS, the garth's hidden silvers (15:55 #2): a trapdoor in the flags, press down to drop in
  const cellar = (x0, x1, top) => { block(x0 - 1, x1 + 1, top + 3, top + 3); air(x0, x1, top + 1, top + 2); boards(x0 + 1, top, x1 - x0 - 1); set(x1 - 1, top + 2, T.SOLID); masonry.push([x1 - 1, x1 - 1, top + 2, top + 2]); };
  cellar(24, 32, 218); ent('silver', 26, 220); coins([28, 220], [30, 220]);
  cellar(62, 69, 212); ent('silver', 64, 214); coins([66, 214]);
  coins([40, 217], [50, 214], [56, 214], [72, 211], [80, 204], [91, 202]);
  const GARTH_CALM = [17, 94, 203, 217];

  /* ================= THE REFECTORY + THE KITCHEN (rows 185-199; the scriptorium's floor 182-184 over it) ================= */
  block(1, W - 2, 182, 184);
  interiors.push([13, 94, 185, 199, 'monkRefectory'], [1, 11, 185, 199, 'monkFlue']);
  block(12, 12, 185, 196); masonry.push([12, 12, 185, 196]);           /* the kitchen wall, its door at the floor */
  // THE FEAST (15:55 #2): the long tables ARE the platforms - at bench height and at table height, the high table on its dais at the east end
  table(15, 26, 197, 200); table(31, 44, 196, 200); table(49, 60, 197, 200); table(64, 76, 196, 200);
  block(80, 87, 198, 199); masonry.push([80, 87, 198, 199]); table(81, 86, 195, 198);   /* the dais and the high table on it */
  boards(13, 191, 12);                                                 /* the reader's pulpit gallery, keyed into the kitchen wall */
  rope(46, 185, 189); boards(42, 190, 9);                              /* a chandelier on its chain: a board ring hung from the roof */
  rope(70, 185, 189); boards(66, 190, 9);
  for (const [x, k, v] of [[18, 'bench', 0], [52, 'bench', 1], [83, 'lectern', 0]]) deco(x, 199, k, v);
  deco(20, 190, 'lectern', 1); deco(14, 190, 'bookpile', 0);
  deco(84, 194, 'lootHeap', 1);                                        /* the high table: what they took, heaped where the abbot ate */
  coins([20, 196], [37, 195], [54, 196], [70, 195], [83, 194], [46, 189], [70, 189]);
  // THE KITCHEN at the west end: the hearth, the stockpot, and the flue over it - and the first checkpoint
  deco(4, 199, 'hearth', 0); deco(10, 199, 'mugShelf', 0);
  ent('check', 3, 199);
  ent('gobpriest', 11, 199, { face: -1, censer: true, cnSkin: 'censerswinger' });   /* THE CENSER-SWINGER (15:55 #3): he tends the hearth brazier, and smothers it under whoever rides it */
  ent('sign', 9, 199, { text: 'THE KITCHEN FLUE. THE HEARTH\'S BRAZIERS STILL BREATHE: RIDE THE SMOKE UP THE CHIMNEY.' });

  /* ================= THE KITCHEN FLUE (tight vertical, 15:55 #1): x6-10, the kitchen's ceiling up to the scriptorium; then the L, east ================= */
  air(6, 10, 182, 184);                                                /* the flue through the refectory's ceiling */
  brazier(7, 200, 8, { phase: 0 }); boards(9, 192, 3);                  /* the hearth's brazier, and a ledge on the kitchen wall */
  brazier(10, 192, 8, { phase: 1.4, snuff: true });                    /* A COLD CENSER: strike it and it breathes */
  boards(6, 184, 3);                                                   /* a ledge in the flue's throat (keyed into its west side) */
  brazier(7, 184, 8, { phase: 2.8, ember: true });
  // the flue's own walls up the chimney breast, then the L: a short smoke tunnel east into the scriptorium's west gallery
  block(1, 12, 163, 181); air(6, 10, 168, 181); air(11, 12, 173, 175);
  boards(9, 176, 2); set(11, 176, T.SOLID); set(12, 176, T.SOLID);
  masonry.push([1, 12, 163, 181]); interiors.push([6, 10, 168, 181, 'monkFlue']);
  coins([8, 188], [9, 180], [7, 172]);

  /* ================= THE SCRIPTORIUM (rows 166-181, x13-83): candle-dark (15:55 #2) ================= */
  block(13, W - 2, 163, 165);                                          /* the dorter's floor over it */
  interiors.push([13, 83, 166, 181, 'monkScript']);
  darkZones.push({ x0: 13 * TS, x1: 84 * TS, y0: 166 * TS, y1: 182 * TS, dark: 0.62, name: 'THE SCRIPTORIUM' });
  boards(13, 176, 14);                                                 /* the west gallery, where the flue comes in */
  // THE STACKS: three stone piers floor to roof, their shelves the way across the dark
  for (const px of [30, 50, 68]) { block(px, px + 1, 166, 178); masonry.push([px, px + 1, 166, 178]); }   /* (open arches at the floor) */
  boards(27, 178, 3); boards(32, 176, 4); boards(46, 177, 4); boards(52, 174, 4); boards(64, 178, 4); boards(70, 175, 4);
  boards(32, 171, 3); boards(47, 171, 3); boards(52, 169, 3); boards(65, 171, 3);   /* the high shelves: a silver on one, candles on the others */
  ent('silver', 53, 168);
  // THE COPYISTS' DESKS: each with its candle - the only light in here
  for (const [x, y] of [[18, 181], [24, 181], [36, 181], [42, 181], [57, 181], [62, 181], [75, 181], [80, 181], [34, 175], [55, 173], [72, 174], [16, 175]]) candle(x, y);
  for (const [x, k, v] of [[19, 'desk', 0], [25, 'desk', 1], [37, 'desk', 0], [43, 'bookshelf', 1], [58, 'desk', 1], [63, 'bookpile', 0], [76, 'desk', 0], [81, 'lectern', 0]]) deco(x, 181, k, v);
  ent('sign', 15, 175, { text: 'THE SCRIPTORIUM. THE CANDLES ARE THE ONLY LIGHT. THE GOBLIN WITH THE SNUFFER KNOWS IT.' });
  ent('snuffer', 40, 181, { face: -1 }); ent('snuffer', 66, 181, { face: -1 });
  ent('gobmage', 53, 173, { face: -1 }); ent('gobpriest', 78, 181, { face: -1 });
  coins([28, 177], [34, 175], [48, 176], [54, 173], [66, 177], [72, 174], [60, 181]);
  block(84, 84, 166, 178); masonry.push([84, 84, 166, 178]);           /* the cells' wall: its door at the scriptorium's floor (179-181) */

  /* ================= THE CELLS (tight vertical, 15:55 #1): x85-93, the scriptorium's floor up to the dorter ================= */
  block(85, 89, 177, 177); boards(90, 177, 3); block(93, 94, 177, 177);   /* cell floors, a hatch at alternate ends */
  boards(85, 172, 3); block(88, 94, 172, 172);
  block(85, 90, 167, 167); boards(91, 167, 3); set(94, 167, T.SOLID);
  masonry.push([85, 94, 177, 177], [85, 94, 172, 172], [85, 94, 167, 167]);
  boards(91, 180, 4); boards(85, 175, 3); boards(92, 170, 3); boards(85, 166, 3);   /* the cots: a step up to each hatch */
  hatch(85, 163, 3);
  interiors.push([85, 94, 166, 181, 'monkTower']);
  for (const [x, y, k, v] of [[87, 181, 'cot', 0], [89, 176, 'lootHeap', 0], [92, 171, 'cot', 1], [87, 171, 'bones', 0]]) deco(x, y, k, v);
  ent('hearthgob', 87, 176, { face: 1 });                              /* asleep in a monk's cell, by its own fire */
  coins([91, 179], [86, 174], [92, 169], [86, 165]);

  /* ================= THE DORTER (rows 149-162): the goblin camp in the monks' dormitory (15:55 #3) ================= */
  block(1, W - 2, 146, 148);                                           /* its roof: the cliff path's floor */
  interiors.push([1, 94, 149, 162, 'monkDorm']);
  for (const px of [28, 58]) { block(px, px + 1, 149, 162); masonry.push([px, px + 1, 149, 162]); air(px, px + 1, 160, 162); }   /* the dormitory's arches: piers to the roof, open at the floor */
  for (const px of [28, 58]) { set(px, 159, T.SOLID); set(px + 1, 159, T.SOLID); }
  // THE BUNKS, two tiers each side of each pier: the camp sleeps in the monks' cots, and the way west goes over them
  boards(22, 159, 6); boards(30, 159, 6); boards(52, 159, 6); boards(60, 159, 6);
  boards(24, 156, 4); boards(30, 156, 4); boards(54, 156, 4); boards(60, 156, 4);
  ent('brazier', 44, 162);                                             /* THE CAMP FIRE, built on the dormitory floor (a fire bowl: it tips) */
  for (const [x, y, k, v] of [[40, 162, 'lootHeap', 2], [48, 162, 'cot', 0], [70, 162, 'cot', 1], [14, 162, 'cot', 0], [36, 162, 'bones', 1], [64, 162, 'lootHeap', 1], [88, 162, 'statue', 0]]) deco(x, y, k, v, k === 'statue' ? { defaced: true } : {});
  ent('hearthgob', 46, 162, { face: 1 }); ent('rockgoblin', 66, 162, { face: 1 }); ent('gobpriest', 34, 159, { face: 1 }); ent('troll', 18, 162, { face: 1 });
  ent('sign', 84, 162, { text: 'THE DORTER. THE MONKS SLEPT HERE. THE GOBLINS DO NOW.' });
  coins([25, 155], [32, 155], [56, 155], [62, 155], [82, 155], [44, 158], [10, 160]);
  // THE WEST END: the ladder to the roof hatch, and THE FIRST SHORTCUT - a bell whose rope goes down the monks' rope well to the kitchen
  hatch(4, 146, 7); boards(8, 149, 3); set(11, 149, T.NET); brazier(5, 163, 14, { phase: 1.0, lift: 210 });   /* the dormitory's warming brazier still breathes: its smoke goes up to the roof hatch */
  boards(1, 163, 2); air(1, 2, 164, 165); air(1, 2, 166, 184);        /* the rope well's trapdoor in the dorter floor, and the well down the chimney breast to the kitchen */
  ent('tbell', 9, 162, { rope: [1, 164, 199] });
  ent('sign', 12, 162, { text: 'A BELL OVER THE ROPE WELL. STRIKE IT AND ITS ROPE UNROLLS TO THE KITCHEN: A QUICK WAY BACK UP.' });

  /* ================= THE CLIFF PATH (rows 119-145): the ONE exterior climb, outside the walls - bats in the cave, birds on the wind ================= */
  block(1, W - 2, 116, 118);                                           /* the crag's shelf the bell towers stand on (its broken floor is cut below) */
  // the start: the dorter roof, the second checkpoint, and THE SECOND SHORTCUT's rope coming down the well from the guardian's door
  ent('check', 10, 145);
  ent('sign', 12, 145, { text: 'THE CLIFF PATH. OUTSIDE THE WALLS NOW: THE BIRDS LIVE OUT HERE.' });
  block(3, 3, 119, 139);                                               /* the rope well's wall (the well runs on down to the roof) */
  // the monks' ROPE LADDER off the roof, up to a scaffold board hung from the shelf
  rope(12, 129, 145); boards(13, 128, 6); rope(18, 119, 127);
  // THE MONKS' HOIST: two baskets on one rope over a wheel in the crag - board one, and ride the other up as it passes
  pair(20, 24, 133, 5, 121); block(19, 26, 119, 120);
  ent('sign', 15, 127, { text: 'THE MONKS\' HOIST. STAND IN A BASKET AND IT SINKS, AND THE OTHER COMES UP PAST YOU. JUMP ACROSS AS IT GOES BY.' });
  // THE HANGING SCAFFOLD the monks strung along the face, each board on its rope from the shelf - one of them old timber that fails
  boards(26, 128, 6); rope(31, 119, 127);                             /* the hoist's top landing: where the rising basket puts you */
  boards(34, 126, 6); rope(39, 119, 125);
  boards(42, 127, 6); rope(47, 119, 126); crumbles.push({ x0: 42, x1: 47, row: 127, rows: 1, count: 3 });
  boards(50, 125, 4); rope(53, 119, 124);
  ent('sign', 36, 125, { text: 'OLD TIMBER. STAND ON IT AND IT COUNTS DOWN, THEN IT GOES - BACK A FEW SECONDS LATER.' });
  // under the broken shelf, crag SPIRES up off the roof: the birds' perches, and yours
  for (const [x0, top, w] of [[55, 127, 3], [61, 129, 3], [66, 127, 3], [72, 129, 3], [77, 127, 5]]) block(x0, x0 + w - 1, top, 145);
  // the last: a rope from the east tower's foot - grab it from the last spire and climb up through the tower's floor
  hatch(83, 116, 4); rope(84, 117, 131);
  // birds on the outside: harpies over the drop, fledglings on the spires, bats round the hoist's crag
  ent('bat', 25, 123); ent('bat', 40, 121); ent('harpy', 63, 122); ent('harpy', 74, 133); ent('fledgling', 56, 126, { face: 1 }); ent('fledgling', 78, 126, { face: -1 });
  coins([12, 140], [12, 134], [16, 127], [28, 127], [36, 125], [44, 126], [51, 124], [56, 126], [62, 128], [67, 126], [73, 128], [84, 124]);
  ent('silver', 14, 127);
  flags.push([30, 120, 50, 121]);

  /* ================= THE BELL TOWERS (rows 88-115, outside, above the cloud): the DRAWBRIDGE (Daniel 11-02 15:58) ================= */
  // the crag under the chapel's west end; THE WEST TOWER stands against it; THE EAST TOWER is the one you climb, from the crevice
  block(1, 49, 85, 118); masonry.push([1, 49, 85, 87]);
  air(1, 2, 85, 118);                                                  /* the rope well runs on down through it */
  block(3, 3, 85, 118);
  // THE BROKEN FLOOR: the shelf is gone between the towers - the drawbridge or the long fall to the cliff path
  air(58, 81, 116, 118);
  // the west tower: a laid pier with its belfry stage open over it
  block(50, 57, 91, 118); masonry.push([50, 57, 91, 115]);
  block(50, 50, 85, 90); set(57, 88, T.SOLID); boards(51, 88, 6);       /* its belfry: a landing three rows over the bridge's end, under the chapel's trapdoor */
  facades.push([50, 57, 85, 115, 'monkTower', { stage: 3 }]);
  // the east tower: walls, a door at the foot, the bell rope up the inside, the bell on its top
  const BX = 82; block(BX, BX, 92, 115); block(BX + 7, BX + 7, 92, 115);
  boards(BX, 91, 8); rope(BX + 3, 92, 115); boards(BX + 4, 94, 3);
  masonry.push([BX, BX, 92, 115], [BX + 7, BX + 7, 92, 115]); interiors.push([BX + 1, BX + 6, 92, 115, 'monkTower']);
  facades.push([BX, BX + 7, 59, 115, 'monkTower', { stage: 5 }]);   /* the tower goes on up past its bell to the guardian hall's floor, and carries it */
  facades.push([58, BX, 59, 62, 'monkArch', { spans: true }]);   /* and an arch from the chapel's east wall to the tower carries the hall floor over the drawbridge */
  ent('tbell', BX + 4, 90, { span: [58, 81, 91] });                    /* THE DRAWBRIDGE: strike it and the bridge comes down to the west tower */
  ent('sign', BX + 5, 115, { text: 'THE BELL TOWERS. STRIKE THE BELL AT THE TOP AND WHAT HANGS FROM ITS TOWER COMES DOWN.' });
  // the drawbridge beats (tools/monastery3-beats.mjs, kept): a harpy and a fledgling over the broken floor, a priest waiting on the far tower
  ent('harpy', 66, 86, { face: 1 }); ent('fledgling', 74, 88, { face: -1 }); ent('gobpriest', 54, 90, { face: 1 });
  coins([62, 90], [68, 90], [74, 90], [86, 93], [86, 100], [86, 107]);
  for (const [x, y, k, v] of [[92, 115, 'prayerFlags', 0], [51, 90, 'bellFrame', 1]]) deco(x, y, k, v);
  flags.push([57, 86, 82, 84], [10, 140, 30, 120]);

  /* ================= THE CHAPEL (rows 59-84, x4-57): pews and the goblin congregation, a priest leading it (15:55 #2) ================= */
  block(58, 58, 59, 87); masonry.push([58, 58, 59, 87]);               /* its east wall (outside it: the sky over the drawbridge) */
  block(3, 3, 59, 84); masonry.push([3, 3, 59, 84]);                   /* the rope well's wall */
  air(1, 2, 59, 84);
  block(50, 57, 85, 87); hatch(51, 85, 6);                                                    /* the way in: up through the floor from the west tower's belfry */
  interiors.push([4, 57, 59, 84, 'monkHall']);
  facades.push([4, 57, 59, 87, 'monkChapel', { roseY: 66 }]);
  // THE PEWS: low benches across the nave (a step up each); the congregation sits in them
  for (const x of [19, 24, 30, 36, 46]) boards(x, 84, 3);
  // THE ALTAR'S CENSER, the way up: the brazier by the sanctuary step lifts you onto the rood loft
  boards(4, 74, 37);                                                   /* the rood loft, keyed into the west wall */
  brazier(42, 85, 11, { phase: 0.6 });
  ent('sign', 44, 84, { text: "THE ALTAR'S CENSER STILL BREATHES. STAND IN THE SMOKE." });
  // A PRAYER WHEEL on the loft: turned to the old relic niche at the west wall; strike it and its stair faces the choir loft and the trapdoor
  wheel(73, 35, 71, 6, 'a');                                           /* turned to the relic niche; strike it and its stair climbs west to the trapdoor */
  air(47, 49, 57, 58); ent('silver', 48, 58);                         /* the relic niche, cut up into the hall's floor: the monks' last silver, where the wheel's other stair goes */
  masonry.push([46, 50, 56, 56]);
  ent('sign', 30, 73, { text: 'THE ROOD WHEEL. STRIKE IT AND ITS STAIR TURNS: ONE WAY THE RELICS, THE OTHER THE TRAPDOOR.' });
  // the congregation and its priest, and the saints they defaced
  ent('gobpriest', 12, 84, { face: 1 });                               /* he leads the rite from the altar steps */
  ent('rockgoblin', 22, 83, { face: 1 }); ent('sentry', 32, 83, { face: 1 }); ent('gobpriest', 39, 84, { face: 1, censer: true, cnSkin: 'censerswinger' }); ent('rockgoblin', 47, 83, { face: 1 });
  for (const [x, y, k, v, o] of [[8, 84, 'statue', 0, { defaced: true }], [16, 84, 'candelabra', 0], [27, 84, 'candelabra', 1], [52, 84, 'statue', 1, { defaced: true }], [10, 73, 'bookshelf', 0], [26, 58, 'lectern', 0]]) deco(x, y, k, v, o || {});
  coins([21, 83], [26, 83], [33, 83], [46, 83], [10, 73], [20, 73], [32, 68], [28, 64], [24, 60], [44, 62], [48, 60]);
  // THE SECOND SHORTCUT, at the guardian's door: a bell whose rope goes down the rope well to the dorter roof
  boards(1, 56, 2); air(1, 2, 57, 58);
  ent('tbell', 6, 55, { rope: [1, 57, 145] });
  ent('sign', 9, 55, { text: 'THE ROPE WELL\'S BELL. STRIKE IT AND ITS ROPE UNROLLS TO THE DORTER ROOF.' });

  /* (claude/falseabbot, Daniel 11-02 15:55 #4 + #6) THE FALSE ABBOT USES THE BUILDING, and the way to him is a ROOFTOP CLIMB: rows 0-31 (src/abbot-chapel.js) */
  const AB = layAbbotChapel({ T, TS, W, set, at, block, air, boards, rope, ent, deco, coins, ents, movers, facades, masonry, interiors, hangers, flags });
  islands.push(...AB.island);

  /* ---- what the art pass reads (art before live): the new props carry their kinds; nothing below is a tile ---- */
  const tall = { top: CLOUD * TS, bottom: 218 * TS, col: '64,70,84', deepest: 0.26 };
  const out = Object.assign({}, R, {
    grid: g, ents, islands: islands.concat([[3, 58, 56, 118, "the crag under the chapel and the guardian's floor: only the rope well parts it from the map wall"], [82, 82, 116, 118, 'the shelf between the broken floor and the crevice, under the east tower'], [3, 3, 119, 139, 'the rope well wall, down the outside of the crag'], [19, 26, 119, 120, 'the hoist hub crag under the shelf'], [13, 94, 163, 165, 'the dorter floor, on the chimney breast and the cells'], [3, 12, 163, 184, 'the kitchen chimney breast: only the rope well parts it from the map wall']]), moversExtra: movers, facades, masonry, interiors, crumbles, darkZones, cloudLine: CLOUD, tall, mon3: true,
    monk: { flags, hangers, boards: (R.monk && R.monk.boards) || [], tables,
      /* (claude/art4) what the art pass paints (src/redraw/mon3_art.js): where the dressing goes, as data */
      m3: { chandeliers: [[46, 185, 190, 42, 50], [70, 185, 190, 66, 74]], flue: [[6, 10, 168, 199]], nooks: [[81, 83, 201, 202]], cells: [[85, 94, 166, 181]],
        dorter: [[1, 27, 162, 151], [30, 57, 162, 151], [60, 93, 162, 151]], bunks: [[22, 159, 6], [30, 159, 6], [52, 159, 6], [60, 159, 6], [24, 156, 4], [30, 156, 4], [54, 156, 4], [60, 156, 4]],
        hubs: [[22 * TS + 8, 121 * TS]], spires: [[55, 127, 3], [61, 129, 3], [66, 127, 3], [72, 129, 3], [77, 127, 5]] } },
    kits: [[18, 94, 203, 217, { density: 0.3, kinds: ['herbBed', 'skep'] }]],
    calm: (R.calm || []).concat([GARTH_CALM, AB.calm]),
    START: { x: 4, y: 217 },
    arena: AB.arena, belfry: null,   /* (claude/falseabbot) the new building's fight; the old belfry's backdrop (the Roc's) is not drawn over it */
  });
  return out;
}
