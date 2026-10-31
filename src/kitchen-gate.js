// src/kitchen-gate.js - THE KITCHEN GATE (claude/kitchengate, the OPUS GREYBOX of the level and its boss, 2026-10-25). Concept scratch/concept-kitchengate.md (Daniel 10-01,
// updated 10-08; 10-24 21:09: this week's top priority with the Rookery). THE UNDERCROWN -> HERE -> HIGHCROWN. The FIRST TIME INSIDE THE CASTLE: you come up out of
// the hole the castle stands on into its cellars, and up through the kitchens and the feast hall to the queen's brother's table. This file is the level the game
// runs, laid by hand (nothing sprinkled); src/kitchen-hands.js is its rule and machines (the fires and their bellows, the coppers' steam, the great spits, the
// grease trails and the tallow doors, the overturned pot, the butcher, the recipe pages); LORD GRUBBAG THE GLUTTON (src/grubbag.js + -hands.js) is its boss.
//
// THE RULE (L.rule): STRIKE A BELLOWS AND ITS FIRE ROARS: THE SPIT OVER IT TURNS, THE COPPER ON IT STEAMS, THE GREASE BY IT BURNS.
//   Every fire in the kitchens is banked low for the night (embers). A BELLOWS stands by each one (L.hoists, the Rootway's data shape: `cleat` is the bellows' cell,
//   so the pilot bot and the guide read it unchanged). STRIKE IT and the fire ROARS for K.roar s (a heat gauge over it drains - the rule's state, drawn) and works
//   what it serves:
//     copper  a STEAM column rises off the copper while it roars: stand in it and it lifts you (L.kgPots; L.reachVents for the reach model)
//     spit    THE GREAT SPIT, a turnspit frame of two iron spits round a hub over the fire pit: it TURNS while the fire roars (and stops when it dies) - ride a spit
//             up (L.kgWheels; its spits are movers, L.moversExtra kg:'spit')
//     trail   a GREASE TRAIL from the fire's grate: the fire CATCHES it, the flame runs along it - burning whatever stands on it (the cooks, THE BUTCHER) - and at
//             its end a TALLOW DOOR (a wall of hard white fat) MELTS: a way opens, and stays open (L.kgTrails, L.kgDoors)
//   The kitchens' own ground plays on it: GREASE FLOORS you slide on (L.slick) and the MEAT-HOOK RAILS across the ceilings (L.zipLines, src/zipline.js: UP under a hook
//   to take hold, it runs downhill). THE OVERTURNED POT (the set piece): a cook tips the great grease pot and the floor goes up behind you - outrun the fire along
//   the grease, or take the hook rail over it (L.kgRace).
//
// (claude/kitchengate2, Daniel 10-27: "look more like a kitchen, more kitchen mechanics" - his approved rec 1) THREE KITCHEN MECHANICS joined the rule, each taught safe, tested, remixed, examined:
//   SERVING-LINE CONVEYORS (L.kgBelts, the main one - they teach LORD GRUBBAG's food line): a belt carries whoever stands on it, and dishes ride it; a blow knocks a dish off (a coin
//     falls out of it). Later ones carry BOMBS too: left alone a bomb's fuse runs out on the line; batted, it skids along to the line's end.
//   STOVE FLARES (L.kgFlares): griddles flare on a rhythm - a glow (the tell), then flame - time your crossing.
//   MEAT-HOOK RAILS: every hook rail is chain-driven now (src/zipline.js dir: it runs one way, hooks and carcasses riding it) - hold on to ride, jump to let go.
//   KITCHEN DRESSING (L.kgProps, greybox): ovens, spice racks, flour sacks, butcher blocks, steam vents, scullery basins, serving hatches, pan racks.
// FIVE NAMED AREAS (A10c: one shrine at the end of each area's exam, one before the boss). Columns; rows: smaller is higher.
//      0-104  THE UNDERCELLARS      TEACH   the root cellar; THE COLD STORE's carcass rail (the hooks, safe: a fall is a climb); THE SCULLERY COPPER (the first bellows,
//                                           REQUIRED, safe: up the well of the scullery on its steam); the wine vaults; exam THE BREWHOUSE COPPER (steam under a
//                                           pot-thrower, REQUIRED); shrine 100
//    104-201  THE SPIT HALL         TEST    THE FIRST SPIT (REQUIRED); THE SECOND SPIT under the cooks (REQUIRED); remix THE STEAM AND THE HOOK (the copper's steam is the
//                                           only way up to the rail over the fire trench, REQUIRED); shrine 198
//    201-300  THE GREASE KITCHENS   REMIX   grease you slide on; THE TALLOW DOOR (the trail burns to it, REQUIRED); THE OVERTURNED POT (the race, two routes); exam THE
//                                           BUTCHER on a trail (the one new foe: burn him); shrine 299
//    300-372  THE FEAST HALL        EXAM    THE THIRD SPIT up to the minstrels' gallery (REQUIRED), THE HEARTH TRENCH on the hooks (REQUIRED), a butcher, a thrower and
//                                           cooks on the grease before THE BUTTERY DOOR (REQUIRED); THE SPICE VAULT (the three recipe pages open it: silver); shrine 368
//    372-432  GRUBBAG'S TABLE       BOSS    LORD GRUBBAG THE GLUTTON in his chair at the high table (claude/grubbagbig: the hall 12 columns wider and 2 rows higher for him at his new size)
// (claude/kitchengate3, Daniel 10-29 live: "the boss is very good now... the level is like a minute, it needs to be a little bit longer... maybe on food zip lines, you have to jump
//   between them") TWO NEW ROOMS, built of the level's own machines, are let in between the old halls - every old hall keeps its own layout, moved east whole (oldCol below):
//    201-279  THE HANGING LARDER    the HOOK-TO-HOOK HOP: TAUGHT safe (a fall is a walk back up the salting racks), then TESTED twice over THE SALTING PIT's coals - the
//                                   second hand-off is onto THE HAUL LINE, a chain that runs UPHILL (src/zipline.js dir) and hauls you up to the attendant's ledge
//    378-470  THE CARVERY           the REMIX: THE CARVING LINE (a serving line) carries you, its dishes, bombs and a cook east to the coals - THE HAUL LINE hangs its foot over
//                                   the line's end and hauls you up over the coals; then a hop over the carving pit onto a rail THE FLUE cuts (a flare out of the coal bed, up
//                                   through the hooks: time your hook to its glow); THE CARVERY DOOR (a stove, its trail, tallow)
//   and THE FEAST HALL's hearth trench (the hooks' exam) is a two-rail hop now. Old columns in the comments below are the OLD grid's: oldCol maps them.
export const KG_INS = [[201, 78], [300, 92]];   /* (claude/kitchengate3) [the old column a room is let in before, its width]: THE HANGING LARDER, THE CARVERY */
export const oldCol = c => c + KG_INS.reduce((s, [at, w]) => s + (c >= at ? w : 0), 0);   /* an OLD-grid column -> where it stands now */
const LARDER = 201, CARVERY = oldCol(300) - 92;   /* the new rooms' first columns (real) */
export const LARDER_COL = LARDER, CARVERY_COL = CARVERY;
export const KITCHEN = { W: oldCol(432), H: 48, arena: [oldCol(390), oldCol(428)], floor: 22, roof: 6 };
export const SECTIONS = [['THE UNDERCELLARS', 0, 104], ['THE SPIT HALL', 104, 201], ['THE HANGING LARDER', LARDER, LARDER + 78], ['THE GREASE KITCHENS', oldCol(201), CARVERY], ['THE CARVERY', CARVERY, oldCol(300)],
  ['THE FEAST HALL', oldCol(300), oldCol(372)], ["GRUBBAG'S TABLE", oldCol(372), oldCol(432)]];
/* (claude/kitchengate3) THE TILE ZONES by column (src/redraw/kitchen_tiles.js zoneOf): the larder is cold cellar brick, the carvery the glazed kitchen tile */
export const KG_ZONES = [[0, 0], [104, 1], [LARDER, 0], [oldCol(201), 2], [oldCol(300), 3], [oldCol(372), 4]];
/* the rule's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/kitchengate.mjs and the brief */
const arc = (a, b) => [oldCol(a), oldCol(b)];
export const ARCS = {
  copper: { teach: [56, 70], test: [82, 98], remix: [160, 186] },
  spit: { teach: [106, 120], test: [134, 148], exam: arc(302, 316) },
  trail: { teach: arc(221, 240), remix: arc(283, 297), reprise: [CARVERY + 77, CARVERY + 86], exam: arc(342, 357) },
  hooks: { teach: [30, 52], test: [164, 186], develop: arc(250, 282), exam: arc(320, 342) },
  grease: { teach: arc(202, 221), develop: arc(246, 282), exam: arc(342, 354) },
  butcher: { teach: arc(283, 298), exam: arc(342, 356) },
  belt: { teach: [5, 17], test: [188, 197], remix: arc(226, 235), reprise: [CARVERY + 4, CARVERY + 27], exam: arc(374, 387) },   /* (claude/kitchengate2) THE SERVING LINES - and the boss's own */
  flare: { teach: [69, 71], test: [128, 130], remix: [CARVERY + 48, CARVERY + 50], exam: arc(377, 384) },
  /* (claude/kitchengate3) THE HOOK-TO-HOOK HOP: taught safe, tested twice over coals (the second onto the uphill haul line), remixed over a serving line and through the flue, examined over the hearth trench */
  hop: { teach: [LARDER + 3, LARDER + 28], test: [LARDER + 33, LARDER + 68], remix: [CARVERY + 26, CARVERY + 72], exam: arc(322, 342) },
};
export const KG_RULE = 'STRIKE A BELLOWS AND ITS FIRE ROARS: THE SPIT OVER IT TURNS, THE COPPER ON IT STEAMS, THE GREASE BY IT BURNS.';
export const WHEEL = { R: 64, n: 2, w: 36, h: 6, period: 7 };   /* THE GREAT SPIT: its radius (px, to a spit's top), its two spits (opposite: banked, one rests in the pit and one at the top - never a stair), a spit's size and one turn's time while it roars */

export function buildKitchenGate({ painter, T, TS }) {
  const { W, H } = KITCHEN;
  const L = painter(W, H), { set: set0, block: block0, ent: ent0 } = L;
  /* (claude/kitchengate3) THE COLUMN MAP IN FORCE: the old halls are written in their OLD columns and land where oldCol puts them (cell by cell, so no span of theirs ever paints
     into a new room); the new rooms set it to their own real columns (M = c => c) while they are laid */
  let M = oldCol;
  const set = (x, y, v) => set0(M(x), y, v), ent = (t, x, y, o) => ent0(t, M(x), y, o);
  const block = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); };
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const shelf = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const spike = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SPIKE); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const FLY = new Set(['bat']);
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ squad }, FLY.has(t) ? { perch: true } : {}, o || {}));
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const deco = (x, y, kind, v) => ent('deco', x, y, { kind, v: v || 0 });
  const hoists = [], fires = [], pots = [], wheels = [], trails = [], doors = [], zipLines = [], slick = [], pages = [], reachVents = [], movers = [], racks = [], belts = [], flares = [], props = [];
  /* (claude/kitchengate2) A SERVING LINE: columns x0..x1 on row f (its top: the floor's own cells, or a counter laid here), the way it runs, its pace; what rides it (every s: dishes, and a bomb every `bomb`th) */
  const belt = (id, x0, x1, f, dir, o) => { x0 = M(x0); x1 = M(x1); const d = Object.assign({ id, x: x0, x0, x1, f, dir, v: 34, every: 3, bomb: 0, foes: false }, o || {}); belts.push(d); return d; };
  /* A STOVE FLARE: a griddle across columns x0..x1 on floor row f; its rhythm (period s: tell s of glow, on s of flame), its phase, the flame's height (px) */
  const flare = (id, x0, x1, f, o) => { x0 = M(x0); x1 = M(x1); const d = Object.assign({ id, x: x0, x0, x1, f, period: 2.6, tell: 0.7, on: 0.9, phase: 0, h: 40 }, o || {}); flares.push(d); return d; };
  const prop = (kind, x, f, o) => props.push(Object.assign({ kind, x: M(x), f }, o || {}));   /* (greybox dressing, drawn behind: never solid) */
  /* A FIRE AND ITS BELLOWS: id, the bellows' cell [bx, feet row] (the cleat: a blow there stokes it), the fire's column and floor row */
  const fire = (id, bx, by, fx, f, o) => { bx = M(bx); fx = M(fx); const d = Object.assign({ id, bx, by, fx, f, pots: [], wheels: [], trails: [] }, o || {}); fires.push(d);
    hoists.push({ id, load: 'stoke', cleat: [bx, by], x: bx, fire: id }); ent0('kgbellows', bx, by, { id }); return d; };
  /* A COPPER on a fire: its column (the steam rises from its mouth at floor row f to row `top`) */
  const copper = (fd, id, x, f, top) => { x = M(x); const d = { id, fire: fd.id, x, f, top }; pots.push(d); fd.pots.push(id); ent0('kgpot', x, f - 1, { id });
    reachVents.push({ t: 'vent', x, y: f - 1, h: (f - top) * TS }); return d; };
  /* THE GREAT SPIT over its fire pit: the hub at column hx, its bottom spit's top on floor row f (the pit's lip) */
  const spitWheel = (fd, id, hx, f, rest = Math.PI / 2) => { hx = M(hx); const d = { id, fire: fd.id, hx, f, x: hx * TS + 8, y: f * TS - WHEEL.R, rest };   /* rest: where its spits stand while it is banked (never a stair: tools/kitchengate.mjs) */ wheels.push(d); fd.wheels.push(id); ent0('kgspit', hx, f - 1, { id });
    for (let k = 0; k < WHEEL.n; k++) movers.push({ kg: 'spit', wheel: id, k, x: d.x - WHEEL.w / 2, y: d.y, w: WHEEL.w, h: WHEEL.h }); return d; };
  /* A GREASE TRAIL from the fire's grate along floor row f, x0 -> x1 (columns), and the TALLOW DOOR at its end, if any */
  const trail = (fd, id, x0, x1, f, door) => { x0 = M(x0); x1 = M(x1); const d = { id, fire: fd.id, x0, x1, f, door: door ? door.id : null }; trails.push(d); fd.trails.push(id); ent0('kgtrail', x0, f - 1, { id }); return d; };
  const tallow = (id, x0, x1, y0, y1) => { block(x0, x1, y0, y1); x0 = M(x0); x1 = M(x1); const d = { id, x0, x1, y0, y1 }; doors.push(d); ent0('kgtallow', x0, y1, { id }); return d; };
  /* A MEAT-HOOK RAIL (src/zipline.js): rows are the FEET rows at each end (the Ksar's lineRope): its high end hangs a reach over the lip you take it from */
  const hookRail = (x0, r0, x1, r1, o) => { x0 = M(x0); x1 = M(x1); const z = Object.assign({ x0: x0 * TS + 8, y0: (r0 + 1) * TS - 22, x1: x1 * TS + 8, y1: (r1 + 1) * TS - 12, hooks: true, speed: 200, meat: true }, o || {});
    if (z.hop) z.hop = z.hop.map(c => M(c) * TS + 8);   /* (claude/kitchengate3) THE HAND-OFF: the stretch of rail (columns) a hop from catches the rail it hands to (z.hand) - drawn on the rail, flown for every hero by tools/kitchengate.mjs */
    z.dir = z.dir ?? ((z.y1 - z.y0) * (z.x1 - z.x0) > 0 ? 1 : -1); zipLines.push(z); return z; };
  /* (claude/kitchengate3) A HAUL LINE: a meat-hook rail whose chain runs UPHILL (src/zipline.js dir: the way it runs, not the slope) - its low end [column, rope y px] and its high
     end, where it lets you off over a ledge; it hauls you up at the rail's pace */
  const haulLine = (xl, yl, xh, yh, o) => { const z = Object.assign({ x0: M(xl) * TS + 8, y0: yl, x1: M(xh) * TS + 8, y1: yh, hooks: true, speed: 200, meat: true, haul: true, dir: Math.sign(xh - xl) }, o || {}); zipLines.push(z); return z; };   /* (claude/kitchengate2) MEAT-HOOK RAILS: chain-driven, they run one way (their low end) - hooks and carcasses ride them */
  const page = (x, y) => { pages.push([M(x), y]); ent('kgpage', x, y, { n: pages.length }); };
  const slk = (x0, x1, f) => slick.push([M(x0), M(x1), f]);   /* a GREASE FLOOR (L.slick) */

  block0(0, W - 1, 0, H - 1);   /* THE CASTLE'S ROCK: every hall is carved out of it (no floating masonry: walls, floors and vaults are the rock itself) */

  // ================= 1. THE UNDERCELLARS (0-104): TEACH =================
  air(1, 72, 28, 39);                                                                    /* the lower cellar: the root cellar, the cold store, the scullery (floor row 40) */
  sign(3, 39, 'THE KITCHEN GATE. UP OUT OF THE UNDERCROWN, INTO THE CASTLE CELLARS.');
  coins([6, 39], [9, 39], [12, 39]); deco(19, 39, 'barrel'); deco(20, 39, 'barrel', 1);
  /* (claude/kitchengate2) THE FIRST SERVING LINE (TEACH, safe): the cellar floor runs east under you, dishes riding it - strike one off */
  belt('cellarLine', 5, 17, 40, 1, { every: 2.6 }); sign(5, 39, 'A SERVING LINE CARRIES WHAT STANDS ON IT. STRIKE A DISH OFF IT.');
  prop('hatch', 4, 40); prop('flour', 23, 40); prop('basin', 66, 40); prop('pans', 12, 34);
  shelf(6, 10, 36); coins([7, 35], [9, 35]); page(8, 35);                                  /* RECIPE PAGE ONE: on the root cellar's rack */
  foe('bat', 14, 31, 'rootCellar'); foe('sprig', 21, 39, 'rootCellar', { face: -1 });
  shelf(17, 21, 35); coins([18, 34], [20, 34]);
  /* THE COLD STORE: the carcass rail over the cold pit (TEACH, safe: a fall is a climb back up the racks). The rail is the only way over */
  block(26, 33, 38, 39);                                                                 /* the ledge the rail is taken from (up two) */
  sign(27, 37, 'THE COLD STORE. A MEAT-HOOK RAIL: STAND UNDER IT, PRESS UP TO TAKE A HOOK. IT RUNS DOWNHILL.');
  air(34, 49, 40, 45);                                                                   /* THE COLD PIT (floor row 46): sixteen wide, six deep */
  shelf(36, 38, 44); shelf(34, 35, 42); shelf(36, 38, 40);                               /* the racks back up its west side */
  ent('silver', 47, 45);                                                                 /* SILVER ONE: the cold pit's far corner (a fall pays) */
  hookRail(33, 37, 51, 39);
  coins([30, 37], [32, 37], [52, 39], [55, 39]);
  foe('bat', 42, 33, 'coldStore');
  /* THE SCULLERY COPPER (TEACH, REQUIRED, safe: nothing else here): the first bellows; the copper's steam is the only way up the well of the scullery */
  const scullery = fire('scullery', 60, 39, 64, 40);
  copper(scullery, 'sculleryCopper', 64, 40, 22);
  air(63, 65, 27, 27);                                                                   /* the well of the scullery: a hole up through the vault into the wine vaults */
  sign(57, 39, 'EVERY FIRE IN THE KITCHENS HAS A BELLOWS. STRIKE IT AND THE FIRE ROARS.');
  sign(61, 39, 'WHILE IT ROARS THE COPPER STEAMS. STAND IN THE STEAM: IT LIFTS YOU.');
  coins([58, 39], [68, 39], [70, 39]);
  /* THE WINE VAULTS (floor row 27) */
  air(56, 89, 17, 26);
  shelf(68, 72, 23); coins([69, 22], [71, 22]); shelf(76, 80, 22); coins([77, 21], [79, 21]);
  deco(58, 26, 'barrel'); deco(60, 26, 'barrel', 1); deco(73, 26, 'barrel');
  /* (claude/kitchengate2) THE FIRST STOVE FLARE (TEACH, safe: nothing else near): a griddle across the vault floor glows, then flares */
  flare('vaultGriddle', 69, 71, 27); sign(67, 26, 'A STOVE FLARES IN TIME. WAIT FOR THE GLOW TO DIE, THEN CROSS.');
  prop('oven', 79, 27); prop('spices', 84, 27);
  foe('hearthgob', 75, 26, 'vaults', { face: -1 }); foe('sprig', 81, 26, 'vaults', { face: -1 });
  coins([60, 26], [70, 26], [78, 26]);
  /* THE BREWHOUSE COPPER (the area's EXAM, REQUIRED): a face eight high; the copper's steam up it, a pot-thrower on the top, a cook at its foot */
  air(84, 89, 9, 16);                                                                    /* the brewhouse flue over the copper */
  air(90, 104, 9, 18); air(102, 104, 19, 25);                                            /* the brewhouse floor (row 19), and its lip (it ends at 101) */
  const brew = fire('brewhouse', 85, 26, 87, 27);
  copper(brew, 'brewCopper', 87, 27, 12);
  sign(83, 26, 'THE BREWHOUSE. STRIKE THE BELLOWS, RIDE THE STEAM UP.');
  foe('rockgoblin', 96, 18, 'brewhouse', { face: -1 }); foe('sprig', 92, 18, 'brewhouse', { face: -1 });
  coins([92, 18], [99, 18]);
  ent('check', 100, 18);                                                                 /* SHRINE ONE: the undercellars are behind you */

  // ================= 2. THE SPIT HALL (104-201): TEST - the great spits =================
  air(105, 200, 4, 25);                                                                  /* THE SPIT HALL (floor row 26) */
  sign(99, 18, 'THE SPIT HALL. THE GREAT SPITS TURN ONLY WHILE THEIR FIRES ROAR.');
  /* THE FIRST SPIT (REQUIRED): the ledge is six high; strike the bellows and ride a spit up */
  const spit1 = fire('spit1', 108, 25, 114, 26);
  air(111, 117, 26, 27); spike(111, 117, 28);                                             /* its fire pit */
  spitWheel(spit1, 'wheel1', 114, 26);
  block(120, 146, 20, 25);                                                               /* the first ledge (up six) */
  sign(106, 25, 'STRIKE THE BELLOWS: THE GREAT SPIT TURNS. STEP ON A SPIT AT THE BOTTOM, OFF AT THE TOP.');
  coins([107, 25], [110, 25]);
  foe('sprig', 125, 19, 'ledgeA', { face: -1 }); foe('hearthgob', 133, 19, 'ledgeA', { face: -1 });
  flare('ledgeGriddle', 128, 130, 20, { period: 2.4 });   /* (claude/kitchengate2) FLARE TEST: between the cooks */ prop('block', 122, 20); prop('spices', 136, 20);
  shelf(124, 127, 17); coins([125, 16]); shelf(129, 132, 14); page(131, 13);             /* RECIPE PAGE TWO: up the pot racks */
  coins([122, 19], [128, 19], [134, 19]);
  /* THE SECOND SPIT (TEST, REQUIRED): from the ledge, under the cooks */
  const spit2 = fire('spit2', 135, 19, 141, 20);
  air(138, 144, 20, 21); spike(138, 144, 22);
  spitWheel(spit2, 'wheel2', 141, 20);
  block(147, 166, 14, 25);                                                               /* the second ledge (up six) */
  foe('bat', 141, 8, 'spit2'); foe('sprig', 152, 13, 'ledgeB', { face: -1 }); foe('rockgoblin', 158, 13, 'ledgeB', { face: -1 });
  coins([149, 13], [155, 13]); shelf(150, 154, 10); coins([151, 9], [153, 9]);
  /* THE STEAM AND THE HOOK (REMIX, REQUIRED): the rail over the fire trench hangs high; the copper's steam is the only way up to it */
  const trench = fire('trench', 161, 13, 164, 14);
  copper(trench, 'trenchCopper', 164, 14, 4);
  sign(160, 13, 'THE RAIL HANGS HIGH OVER THE TRENCH. STOKE THE COPPER, RISE ON ITS STEAM, CATCH A HOOK.');
  spike(167, 185, 26);                                                                   /* THE FIRE TRENCH: its floor is coals */
  hookRail(164, 5, 186, 13);
  block(186, 200, 14, 25);                                                               /* the far floor */
  foe('bat', 176, 9, 'trench'); foe('rockgoblin', 191, 13, 'farFloor', { face: -1 }); foe('hearthgob', 195, 13, 'farFloor', { face: -1 });
  /* (claude/kitchengate2) BELT TEST: the far floor's serving line runs WEST, back toward the trench - walk against it, and its cooks ride it at you */
  belt('farLine', 188, 197, 14, -1, { v: 40, every: 2.8, foes: true }); prop('hatch', 199, 14); prop('flour', 187, 14);
  coins([188, 13], [193, 13]); shelf(188, 192, 10); coins([189, 9], [191, 9]);
  ent('check', 198, 13);                                                                 /* SHRINE TWO: the spit hall is behind you */

  // ================= (claude/kitchengate3) THE HANGING LARDER (201-279, new): THE HOOK-TO-HOOK HOP =================
  M = c => c; {
  const a = LARDER;
  /* the larder hall: its lip (the spit hall's far floor runs on, row 14), the teach pit (a safe floor, row 23), the first landing (row 19), THE SALTING PIT (coals, row 26), the attendant's
     ledge (row 16), and the step down to the grease kitchens' floor (row 24) */
  air(a, a + 77, 6, 13); air(a + 4, a + 24, 14, 22); air(a + 25, a + 33, 14, 18); air(a + 34, a + 68, 14, 25); spike(a + 34, a + 68, 26); air(a + 69, a + 77, 14, 15);   /* (the ledge runs to the larder's end: you step off it into the grease kitchens, as you once stepped off the spit hall's floor) */
  sign(a + 0, 13, "THE HANGING LARDER. THE HOOK RAILS RUN ON CHAINS: AT A RAIL'S END IT DROPS YOU.");
  /* TEACH (safe): two rails, the second lower and under the first's end. JUMP in the red stretch (the hand-off) and you carry your height to the next hook; ride to the end and you
     drop into the larder pit - a floor, and the salting racks back up to the lip */
  const t2 = hookRail(a + 15, 16, a + 28, 18); hookRail(a + 3, 13, a + 14, 15, { hop: [a + 10.6, a + 13.2], hand: t2 });
  sign(a + 3, 13, 'JUMP OFF IN THE RED STRETCH AND CATCH THE NEXT HOOK. A FALL HERE IS ONLY A CLIMB.');
  shelf(a + 5, a + 7, 20); shelf(a + 5, a + 7, 17); racks.push([a + 5, a + 7, 20], [a + 5, a + 7, 17]);   /* the salting racks: the way back up from the pit */
  /* the larder's shelving (a second height; none of it a way past a rail): a spice shelf over the lip, a salting rack in the pit (it reaches the first rail again - a retry, not a way round), a salt-box
     shelf over the first landing, a ham shelf over the attendant's ledge */
  for (const [x0, x1, y] of [[a + 0, a + 3, 11], [a + 8, a + 11, 19], [a + 26, a + 29, 16], [a + 30, a + 33, 13]]) { shelf(x0, x1, y); racks.push([x0, x1, y]); ent('coin', Math.round((x0 + x1) / 2), y - 1); }
  /* THE HAM RACKS: the larder's own - high under the vault over the teach pit and the attendant's ledge, the hams hung from them (out of reach: no coin on them, and no way past a rail) */
  for (const [x0, x1, y] of [[a + 12, a + 15, 9], [a + 17, a + 20, 9], [a + 22, a + 24, 9], [a + 70, a + 73, 12], [a + 75, a + 77, 12]]) { shelf(x0, x1, y); racks.push([x0, x1, y]); prop('pans', x0 + 1, y); }
  deco(a + 9, 22, 'barrel'); deco(a + 12, 22, 'barrel', 1); deco(a + 20, 22, 'barrel'); coins([a + 14, 22], [a + 17, 22], [a + 14, 13], [a + 15, 13]);   /* (the two in the air ride the hop's arc: a trail to follow) */
  prop('pans', a + 10, 10); prop('flour', a + 22, 23); prop('block', a + 30, 19); prop('spices', a + 70, 16);
  /* the first landing: two cooks at their blocks */
  foe('sprig', a + 29, 18, 'larderA', { face: -1 }); foe('hearthgob', a + 32, 18, 'larderA', { face: -1 }); coins([a + 26, 18], [a + 31, 18]);
  /* TEST, TWICE, OVER THE SALTING PIT's COALS: a hop to a lower rail, and a hop from that onto THE HAUL LINE - a chain that runs UPHILL - to the attendant's ledge */
  const s3 = haulLine(a + 56, 398, a + 71, 200), s2 = hookRail(a + 45, 21, a + 55, 23, { hop: [a + 51.4, a + 53.9], hand: s3 }); hookRail(a + 33, 18, a + 44, 20, { hop: [a + 40.6, a + 43.2], hand: s2 });
  sign(a + 30, 18, 'THE SALTING PIT. TWO HAND-OFFS OVER THE COALS. THE LAST CHAIN HAULS YOU UP.');
  coins([a + 44, 18], [a + 45, 18], [a + 54, 20], [a + 55, 20], [a + 60, 21], [a + 64, 18]);   /* on the hops' arcs and up the haul line */
  /* the attendant's ledge: he throws plates as you come up the haul line, and holds the ledge */
  foe('attendant', a + 72, 15, 'larderB', { face: -1 }); coins([a + 70, 15], [a + 73, 15]);

  }
  M = oldCol;

  // ================= 3. THE GREASE KITCHENS (201-300): REMIX - grease, and the fire on it =================
  air(201, 299, 8, 23);                                                                  /* THE GREASE KITCHENS (floor row 24) */
  sign(203, 23, 'THE GREASE KITCHENS. ON GREASE YOU SLIDE: SLOW TO GET GOING, SLOWER TO STOP.');
  slk(202, 216, 24);
  air(218, 220, 24, 25); spike(218, 220, 26);                                            /* a coal pit at the end of the slide */
  foe('sprig', 211, 23, 'greaseA', { face: -1 });
  coins([205, 23], [209, 23], [214, 23]); shelf(205, 209, 20); coins([206, 19], [208, 19]);
  /* THE TALLOW DOOR (REMIX, REQUIRED): the stove's grease trail runs to a wall of hard fat; strike the bellows, the trail burns, the door melts */
  block(236, 245, 8, 13);                                                                /* the wall over the door */
  const stove1 = fire('stove1', 223, 23, 225, 24);
  const door1 = tallow('door1', 238, 239, 14, 23);
  trail(stove1, 'trail1', 226, 237, 24, door1);
  sign(222, 23, 'A TALLOW DOOR. THE GREASE TRAIL RUNS TO IT: STOKE THE STOVE, AND KEEP OFF THE TRAIL.');
  /* (claude/kitchengate2) BELT REMIX: a serving counter over the trail (three rows up) - stand on it while the trail burns; it carries you toward the burning end. Its first BOMBS:
     left alone one goes off on the counter, batted it skids off the end */
  shelf(226, 235, 21); belt('trailCounter', 226, 235, 21, 1, { every: 3.2, bomb: 3 }); sign(227, 20, 'A BOMB ON THE LINE: BAT IT ALONG, OR STAND CLEAR.');
  prop('vent', 242, 24); prop('pans', 230, 15); prop('block', 290, 24); prop('vent', 268, 24); prop('spices', 214, 24);
  foe('hearthgob', 229, 23, 'tallow1', { face: -1 }); foe('sprig', 233, 23, 'tallow1', { face: -1 });
  coins([224, 23], [241, 23], [244, 23]);
  /* THE OVERTURNED POT (THE SET PIECE): a cook tips the great grease pot and the floor burns behind you. LOW: slide the grease (a coal pit halfway). HIGH: the racks to
     the hook rail over it, faster than the fire. The fire stops at the stone threshold */
  slk(246, 282, 24);
  air(262, 264, 24, 25); spike(262, 264, 26);
  shelf(249, 251, 21); shelf(252, 256, 18); page(254, 17);                                /* the racks up to the rail; RECIPE PAGE THREE on the top one */
  hookRail(256, 17, 281, 23, { race: true });   /* (the high route over the race: optional) */
  const race = { x0: M(246), x1: M(283), f: 24, trig: M(249), pot: [M(247), 23], v: 66, behind: 2.6 };
  sign(245, 23, 'THE GREAT GREASE POT.');
  foe('sprig', 248, 23, 'pot', { face: -1 }); foe('sprig', 269, 23, 'race', { face: -1 });
  shelf(274, 278, 20); foe('attendant', 276, 19, 'race', { face: -1, perch: true });   /* (claude/kitchengate2) THE ATTENDANT throws plates from the dresser */
  coins([250, 23], [256, 23], [260, 23], [267, 23], [272, 23], [279, 23]);
  /* THE BUTCHER (the area's EXAM; the level's ONE new foe): on the stove's trail. Stoke it as he stands on it: he burns */
  const stove2 = fire('stove2', 284, 23, 286, 24);
  trail(stove2, 'trail2', 287, 296, 24, null);
  sign(283, 23, 'THE BUTCHER. HIS CLEAVER CANNOT BE BLOCKED. BURNING GREASE STOPS HIM DEAD.');
  foe('butcher', 293, 23, 'butcherA', { face: -1 });
  coins([288, 23], [297, 23]); shelf(288, 292, 20); coins([289, 19], [291, 19]);
  ent('check', 299, 23);                                                                 /* SHRINE THREE: the grease kitchens are behind you */

  // ================= (claude/kitchengate3) THE CARVERY (378-470, new): THE REMIX - a conveyor to the haul line's foot, a hop, and the flue that cuts the hooks =================
  M = c => c; {
  const b = CARVERY;
  /* the carving floor (row 24: the grease kitchens' floor runs on) and its line, the carving block at the line's end, the haul pit (coals, row 27), the carvers' perch (top row 14), the
     carving pit (coals), the landing and THE CARVERY DOOR (row 22: the feast hall's floor) */
  air(b, b + 28, 6, 23); air(b + 29, b + 39, 6, 26); spike(b + 29, b + 39, 27); air(b + 40, b + 45, 6, 13); air(b + 46, b + 69, 6, 26); spike(b + 46, b + 69, 27); air(b + 70, b + 91, 6, 21);
  block(b + 28, b + 28, 23, 23);   /* THE CARVING BLOCK: the line stops you against it, at the coals' lip */
  sign(b + 1, 23, 'THE CARVERY. THE LINE CARRIES YOU TO THE COALS: HOLD UP UNDER THE HAUL HOOK.');
  /* REMIX 1: THE CARVING LINE - the floor is a serving line running EAST, to the coals: it carries you, its dishes, its BOMBS (bat them on: they go off in the pit) and a cook. THE HAUL
     LINE's foot hangs over the line's end, by the carving block - hold UP as the line brings you under it and it hauls you up over the coals to the carvers' perch */
  belt('carveLine', b + 4, b + 27, 24, 1, { v: 40, every: 2.4, bomb: 3, foes: true });
  haulLine(b + 21, 380, b + 42, 170);   /* (its rope clears the perch's face by a body: it lets you off over the perch, never into its wall) */
  foe('sprig', b + 16, 23, 'carvery', { face: -1 }); prop('hatch', b + 5, 24); prop('block', b + 2, 24);
  /* the carvers' perch: a cook at his block */
  prop('pans', b + 42, 10);   /* the carvers' perch stands EMPTY: it is where the flue is read (its cook waits on the landing) */
  /* the carvery's dressers: one height over the carving line (one only: the line's floor is no way up), over the perch, over the landing and the door's trail */
  /* the carving counters (low, row 22) and a dresser beside each (row 19, up off a counter), the ham rack over the line's end (high, out of reach) */
  for (const [x0, x1, y] of [[b + 5, b + 8, 22], [b + 15, b + 18, 22]]) { shelf(x0, x1, y); racks.push([x0, x1, y]); }
  shelf(b + 24, b + 27, 12); racks.push([b + 24, b + 27, 12]); prop('pans', b + 25, 12);
  for (const [x0, x1, y] of [[b + 1, b + 4, 19], [b + 9, b + 12, 19], [b + 19, b + 22, 19], [b + 42, b + 45, 11], [b + 71, b + 74, 19], [b + 76, b + 79, 19], [b + 80, b + 83, 16], [b + 88, b + 91, 19]]) { shelf(x0, x1, y); racks.push([x0, x1, y]); ent('coin', Math.round((x0 + x1) / 2), y - 1); }
  coins([b + 30, 21], [b + 34, 18], [b + 37, 16]);   /* up the haul line */
  /* REMIX 2: THE FLUE - a flare out of the coal bed, a sheet of fire up through the hooks, cuts the first rail just off the perch (in sight of it): take your hook as its flame
     dies (or early in its glow) and you are past before the next; then the hop over the carving pit (tools/kitchengate.mjs flies it: 0.15-0.45 s from the perch to the flue) */
  const fl = flare('flue', b + 48, b + 50, 27, { period: 2.4, tell: 0.8, on: 0.8, phase: 0, h: 220, bed: 'coals' });
  const c2 = hookRail(b + 57, 16, b + 72, 21); hookRail(b + 45, 13, b + 56, 15, { hop: [b + 52.6, b + 55.2], hand: c2, flue: { id: fl.id, tIn: 0.15, tOut: 0.45 } });
  sign(b + 44, 13, 'THE FLUE FLARES UP THROUGH THE HOOKS. TAKE A HOOK AS ITS FLAME DIES.');
  coins([b + 56, 13], [b + 57, 13]);   /* on the hop's arc */
  /* THE CARVERY DOOR (the trail, again): the carvers' stove, its grease trail, a cook on it, and a tallow door at its end */
  block(b + 83, b + 90, 6, 12);
  const stove4 = fire('stove4', b + 74, 21, b + 76, 22);
  const door3 = tallow('door3', b + 85, b + 86, 13, 21);
  trail(stove4, 'trail4', b + 77, b + 84, 22, door3);
  sign(b + 73, 21, 'THE CARVERY DOOR. STOKE THE STOVE: THE TRAIL BURNS TO THE TALLOW.');
  foe('sprig', b + 81, 21, 'carveDoor', { face: -1 }); foe('hearthgob', b + 72, 21, 'carveDoor', { face: -1 }); coins([b + 71, 21], [b + 88, 21], [b + 90, 21]); prop('oven', b + 71, 22);
  }
  M = oldCol;

  // ================= 4. THE FEAST HALL (300-372): THE EXAM - every use at once =================
  block(300, 372, 22, 23);                                                               /* the hall's floor (row 22: up two) */
  air(300, 372, 6, 21);
  sign(301, 21, "THE FEAST HALL. THE QUEEN'S BROTHER DINES AT ITS HEAD.");
  /* THE THIRD SPIT (REQUIRED) up to the minstrels' gallery */
  const spit3 = fire('spit3', 304, 21, 310, 22);
  air(307, 313, 22, 23); spike(307, 313, 24);
  spitWheel(spit3, 'wheel3', 310, 22);
  block(316, 322, 16, 21);                                                               /* THE MINSTRELS' GALLERY (up six) */
  foe('bat', 312, 11, 'spit3'); foe('sprig', 319, 15, 'gallery', { face: -1 });
  coins([317, 15], [321, 15]);
  /* THE HEARTH TRENCH on the hooks (REQUIRED) - (claude/kitchengate3) the hop's EXAM: two rails now, a hand-off over the coals */
  air(323, 340, 22, 25); spike(323, 340, 26);
  { const h2 = hookRail(332, 18, 342, 21); hookRail(322, 15, 331, 17, { hop: [327.6, 330.2], hand: h2 }); coins([331, 15], [332, 15]); }   /* (the coins ride the hop's arc) */
  sign(316, 15, 'THE HEARTH TRENCH. TAKE A HOOK OFF THE GALLERY, AND HAND OFF IN THE RED.');
  /* THE BUTTERY DOOR (REQUIRED): grease, a butcher on the trail, a thrower on the dresser, a cook - and the door at the trail's end */
  slk(341, 354, 22);
  block(353, 360, 6, 12);                                                                /* the wall over the buttery door */
  const stove3 = fire('stove3', 343, 21, 345, 22);
  const door2 = tallow('door2', 355, 356, 13, 21);
  trail(stove3, 'trail3', 346, 354, 22, door2);
  foe('butcher', 350, 21, 'buttery', { face: -1 }); shelf(346, 349, 18); foe('attendant', 347, 17, 'buttery', { face: 1, perch: true }); foe('sprig', 352, 21, 'buttery', { face: -1 });
  sign(342, 21, 'THE BUTTERY DOOR.');
  coins([344, 21], [358, 21], [361, 21]);
  /* THE SPICE VAULT: a cellar under the floor behind an iron grate; the head cook's three recipe pages open it (silver) */
  air(359, 366, 24, 27); shelf(362, 363, 25);
  const vault = { x0: M(362), x1: M(363), y0: 22, y1: 23, need: 3 };
  ent('kgvault', 362, 21, {}); ent('silver', 365, 27);
  sign(361, 21, "THE SPICE VAULT. THE HEAD COOK'S THREE RECIPE PAGES OPEN ITS GRATE.");
  foe('hearthgob', 364, 21, 'vaultDoor', { face: -1 });
  ent('check', 368, 21);                                                                 /* SHRINE FOUR: his door */
  prop('oven', 302, 22); prop('spices', 318, 16); prop('basin', 344, 22); prop('hatch', 366, 22); prop('flour', 358, 22);
  sign(370, 21, 'HE NEVER LEAVES HIS CHAIR. KNOCK HIS DISHES OFF THE LINE: LET THE BOMBS REACH HIM.');

  /* THE KITCHEN SHELVES: pot racks and dressers along the walls (a second height, coins on them) - never where one would climb a face a machine is for */
  for (const [a, b, y] of [[24, 27, 34], [58, 61, 23], [84, 86, 22], [93, 97, 15], [150, 153, 7], [157, 161, 10], [196, 199, 10], [212, 216, 20], [241, 244, 19], [259, 262, 19], [266, 270, 19], [292, 296, 20], [362, 366, 18]]) { shelf(a, b, y); racks.push([M(a), M(b), y]); ent('coin', Math.round((a + b) / 2), y - 1); }

  // ================= 5. GRUBBAG'S TABLE (374-428): LORD GRUBBAG THE GLUTTON =================
  /* The high table's hall: the floor (row 22), his reinforced chair at the east end hard against the wall (claude/grubbagbig: he is ~225 px across now and fills it), the high table
     under his belly, the KITCHEN HATCH high in the west wall over its PIE OVEN, the oven's bellows, and THE SERVING LINE - a hook rail under the roof from the hatch to his table (the
     dishes ride it). Two benches along the hall, and THE GALLERY (a shelf two benches up, west of his table): from it a hero can come down on his belly (a plunge, GB.above). */
  /* (claude/kitchengate2, Daniel 10-27) HE SITS AT THE HEAD OF THE SERVING LINE: a conveyor counter two rows up (one-way: you jump up onto it, it carries you toward him) from the
     kitchen hatch to his platter; two shelves over it (the lob lands on whatever you stand on); the pepper stove and its bellows by the hatch; the grease cauldron hung on a chain
     over the line's end. The table is the line's own end (his platter). */
  const [A0, A1] = [390, 428], FL = KITCHEN.floor, RF = KITCHEN.roof;   /* (claude/kitchengate3) his hall is painted in its OLD columns (M); his arena's data below is in real ones (KITCHEN.arena) - the hall itself is untouched */
  air(373, A0 - 2, 12, FL - 1);                                                          /* the passage from the feast hall to his table */
  /* (claude/kitchengate2) THE SERVING PASSAGE (the belt's and the flare's EXAM, and the approach that sets him up - B8): his own serving line runs east into his hall, two griddles
     set in it flare in turn, dishes and bombs ride it to him, and an attendant stands on it */
  belt('passageLine', 374, 387, FL, 1, { v: 36, every: 2.6, bomb: 3 }); flare('passGriddle1', 377, 378, FL, { period: 2.4, phase: 0 }); flare('passGriddle2', 383, 384, FL, { period: 2.4, phase: 1.2 });
  sign(373, FL - 1, 'HIS SERVING LINE. EVERY DISH ON IT GOES TO HIM.'); foe('attendant', 386, FL - 1, 'passage', { face: -1 }); prop('hatch', 388, FL);
  air(A0 - 1, A1 + 1, RF, FL - 1);
  /* (claude/kitchengate4) ONE SHELF now (the west one): the upper hook rail runs where the east one stood */
  { const BELT = [A0 + 7, A1 - 16, FL - 2], PLATS = [[A0 + 9, A0 + 12, FL - 5]]; shelf(BELT[0], BELT[1], BELT[2]); for (const [a, b, y] of PLATS) shelf(a, b, y); }
  /* (claude/kitchengate4, Daniel 10-30) THE COAL TRENCH: the floor under the serving line cut down three rows to a coal bed (columns TR0..TR1), a chain-link step one row up at
     either end (the climb back up: a fall is a coal bite and a climb, never a death); the hall's entry and his table side stay on the old floor */
  const TR0 = A0 + 9, TR1 = A1 - 18; air(TR0, TR1, FL, FL + 2); air(TR0 - 1, TR0 - 1, FL, FL + 1); air(TR1 + 1, TR1 + 1, FL, FL + 1);
  /* THE MEAT-HOOK RAILS (src/zipline.js, chain-driven east, hatch -> platter): the LOWER taken from the line under the hatch (its rope 20 px over the line's top), its red stretch
     the hop onto the UPPER, which climbs over the trench and ENDS OVER HIS PLATTER (its end lets you drop on it: THE THIRD OPENING, src/grubbag.js platterDrop) */
  const PXC = c => (M(Math.floor(c)) + (c - Math.floor(c))) * TS;
  const railB = { x0: PXC(A0 + 13.5), y0: 276, x1: PXC(A1 - 17.5), y1: 262, hooks: true, speed: 200, meat: true, dir: 1, arena: true, id: 'kg-arena-b', platter: true };
  const railA = { x0: PXC(A0 + 7.5), y0: 300, x1: PXC(A0 + 16.5), y1: 300, hooks: true, speed: 200, meat: true, dir: 1, arena: true, id: 'kg-arena-a', upOnly: true, hop: [PXC(A0 + 11.5), PXC(A0 + 14.5)], hopRush: [PXC(A0 + 10), PXC(A0 + 13)], hand: railB };
  zipLines.push(railA, railB);
  sign(A0 - 1, FL - 1, 'RIDE THE HOOK, DROP ON HIS PLATTER.');
  ent('torch', A0 + 1, FL - 1); ent('torch', A1 - 16, FL - 1);   /* (claude/kitchengate4: the east torch off the trench, on his table side) */
  ent('grubbag', A1 - 7, FL - 1);

  const arena = (([A0, A1]) => { const BELT = [A0 + 7, A1 - 16, FL - 2], PLATS = [[A0 + 9, A0 + 12, FL - 5]]; return { x0: A0 * TS, x1: (A1 + 1) * TS, floor: FL * TS, y0: RF * TS, trigger: (A0 + 6) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'grubbag', music: 'grubbag', tint: '#f0c890', tintA: 0.06,
    /* THE TABLE (src/grubbag.js geom): his chair's column, his platter (the line's end), the pepper stove and its bellows, THE SERVING LINE (the conveyor: first and last column,
       its top row), the shelves, the grease cauldron's hook (column, row) */
    chair: A1 - 7, table: [A1 - 18, A1 - 15], oven: A0 + 2, bellows: A0 + 5, belt: BELT, plats: PLATS, cauldron: [A1 - 17, 13],
    /* (claude/kitchengate4) THE COAL TRENCH (the coal bed's columns, its top row) and its two chain-link steps; the arena's two hook rails */
    trench: [A0 + 9, A1 - 18, FL + 3], steps: [A0 + 8, A1 - 17], rails: [railA, railB] }; })(KITCHEN.arena);
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 39 }, pools: [], falls: [],
    arena, kitchen: true, kgKit: true, hoists, kgFires: fires, kgPots: pots, kgWheels: wheels, kgTrails: trails, kgDoors: doors, kgRace: race, kgPages: pages, kgVault: vault, kgRacks: racks,
    zipLines, slick, reachVents, moversExtra: movers, kgBelts: belts, kgFlares: flares, kgProps: props,
    calm: [[0, W - 1, 0, H - 1]],
    noCoin: [[oldCol(397), oldCol(412), 16, 24]],   /* (claude/kitchengate4) no gold sprinkled in (or over) the coal trench: nothing lures you onto the coals */   /* placed wholly by hand: nothing sprinkled */
    checkRun: 330,                  /* (claude/kitchengate3: 330 - the larder and the carvery widened two spans) four shrines, one closing each area's exam (A10c): src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: KITCHEN.arena[0], hi: W - 1, spots: 0, why: "GRUBBAG'S TABLE: the boss's hall - no squad stands in a boss arena" }, ...[600].filter(lo => lo > KITCHEN.arena[0] && lo < W).map(lo => ({ lo, hi: W - 1, spots: 0, why: "GRUBBAG'S TABLE, the sprinkle section that starts at " + lo + " (tools/sprinkle-cap.mjs keys a band on its section start): his hall's east wall" }))]   /* (claude/kitchengate3: the 400-column band went - section 3 now holds the carvery and the feast hall, both with squads) */,
    unlocks: [
      { kind: 'hoists', opens: 'a lift (the copper\'s steam), a ride up (the great spit), a door (the grease burns to the tallow door and melts it)', hud: 'THE FIRE ROARS' },
      { kind: 'kgpage', opens: 'secret', hud: 'RECIPE PAGES n/3: THE SPICE VAULT' },
    ],
    duskStart: -1, duskLen: 1, music: 'kitchengate', night: false, glowNight: false,
    interiors: [[1, 72, 28, 46, 'cellar'], [56, 104, 9, 26, 'cellar'], [105, 200, 4, 28, 'keep'], [LARDER, LARDER + 77, 6, 26, 'cellar'], [oldCol(201), CARVERY - 1, 8, 27, 'keep'], [CARVERY, oldCol(300) - 1, 6, 27, 'keep'], [oldCol(300), oldCol(388), 6, 27, 'royal'], [oldCol(389), oldCol(430), 6, 24, 'royal']],   /* INSIDE THE CASTLE: every hall has a back wall, never the sky (the art lane gives each its own) */
    palette: { hall: true, sky: 'night', dress: 'none', ledges: 'beam', haze: 'rgba(255,170,90,0.10)', dirt: '#5e4a3a', dirtL: '#7a6450', dirtD: '#3a2c22', grass: '#8a7058', grassL: '#a88a6a', grassD: '#5a4636' },
    ambient: [{ x0: 0, x1: 99999, kind: 'cave' }],
    tints: [[-24, 104, [180, 190, 210], 0.07], [104, LARDER, [255, 200, 150], 0.07], [LARDER, oldCol(201), [180, 196, 214], 0.07], [oldCol(201), CARVERY, [255, 210, 160], 0.07], [CARVERY, oldCol(300), [255, 205, 160], 0.07], [oldCol(300), oldCol(372), [255, 215, 170], 0.06], [oldCol(372), W + 24, [255, 200, 140], 0.08]],
    reachExact: false,
  };
}
