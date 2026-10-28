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
export const KITCHEN = { W: 432, H: 48, arena: [390, 428], floor: 22, roof: 6 };
export const SECTIONS = [['THE UNDERCELLARS', 0, 104], ['THE SPIT HALL', 104, 201], ['THE GREASE KITCHENS', 201, 300], ['THE FEAST HALL', 300, 372], ["GRUBBAG'S TABLE", 372, 432]];
/* the rule's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/kitchengate.mjs and the brief */
export const ARCS = {
  copper: { teach: [56, 70], test: [82, 98], remix: [160, 186] },
  spit: { teach: [106, 120], test: [134, 148], exam: [302, 316] },
  trail: { teach: [221, 240], remix: [283, 297], exam: [342, 357] },
  hooks: { teach: [30, 52], test: [164, 186], develop: [250, 282], exam: [320, 342] },
  grease: { teach: [202, 221], develop: [246, 282], exam: [342, 354] },
  butcher: { teach: [283, 298], exam: [342, 356] },
  belt: { teach: [5, 17], test: [188, 197], remix: [226, 235], exam: [374, 387] },   /* (claude/kitchengate2) THE SERVING LINES - and the boss's own */
  flare: { teach: [69, 71], test: [128, 130], exam: [377, 384] },
};
export const KG_RULE = 'STRIKE A BELLOWS AND ITS FIRE ROARS: THE SPIT OVER IT TURNS, THE COPPER ON IT STEAMS, THE GREASE BY IT BURNS.';
export const WHEEL = { R: 64, n: 2, w: 36, h: 6, period: 7 };   /* THE GREAT SPIT: its radius (px, to a spit's top), its two spits (opposite: banked, one rests in the pit and one at the top - never a stair), a spit's size and one turn's time while it roars */

export function buildKitchenGate({ painter, T, TS }) {
  const { W, H } = KITCHEN;
  const L = painter(W, H), { set, block, ent } = L;
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
  const belt = (id, x0, x1, f, dir, o) => { const d = Object.assign({ id, x: x0, x0, x1, f, dir, v: 34, every: 3, bomb: 0, foes: false }, o || {}); belts.push(d); return d; };
  /* A STOVE FLARE: a griddle across columns x0..x1 on floor row f; its rhythm (period s: tell s of glow, on s of flame), its phase, the flame's height (px) */
  const flare = (id, x0, x1, f, o) => { const d = Object.assign({ id, x: x0, x0, x1, f, period: 2.6, tell: 0.7, on: 0.9, phase: 0, h: 40 }, o || {}); flares.push(d); return d; };
  const prop = (kind, x, f, o) => props.push(Object.assign({ kind, x, f }, o || {}));   /* (greybox dressing, drawn behind: never solid) */
  /* A FIRE AND ITS BELLOWS: id, the bellows' cell [bx, feet row] (the cleat: a blow there stokes it), the fire's column and floor row */
  const fire = (id, bx, by, fx, f, o) => { const d = Object.assign({ id, bx, by, fx, f, pots: [], wheels: [], trails: [] }, o || {}); fires.push(d);
    hoists.push({ id, load: 'stoke', cleat: [bx, by], x: bx, fire: id }); ent('kgbellows', bx, by, { id }); return d; };
  /* A COPPER on a fire: its column (the steam rises from its mouth at floor row f to row `top`) */
  const copper = (fd, id, x, f, top) => { const d = { id, fire: fd.id, x, f, top }; pots.push(d); fd.pots.push(id); ent('kgpot', x, f - 1, { id });
    reachVents.push({ t: 'vent', x, y: f - 1, h: (f - top) * TS }); return d; };
  /* THE GREAT SPIT over its fire pit: the hub at column hx, its bottom spit's top on floor row f (the pit's lip) */
  const spitWheel = (fd, id, hx, f, rest = Math.PI / 2) => { const d = { id, fire: fd.id, hx, f, x: hx * TS + 8, y: f * TS - WHEEL.R, rest };   /* rest: where its spits stand while it is banked (never a stair: tools/kitchengate.mjs) */ wheels.push(d); fd.wheels.push(id); ent('kgspit', hx, f - 1, { id });
    for (let k = 0; k < WHEEL.n; k++) movers.push({ kg: 'spit', wheel: id, k, x: d.x - WHEEL.w / 2, y: d.y, w: WHEEL.w, h: WHEEL.h }); return d; };
  /* A GREASE TRAIL from the fire's grate along floor row f, x0 -> x1 (columns), and the TALLOW DOOR at its end, if any */
  const trail = (fd, id, x0, x1, f, door) => { const d = { id, fire: fd.id, x0, x1, f, door: door ? door.id : null }; trails.push(d); fd.trails.push(id); ent('kgtrail', x0, f - 1, { id }); return d; };
  const tallow = (id, x0, x1, y0, y1) => { const d = { id, x0, x1, y0, y1 }; doors.push(d); block(x0, x1, y0, y1); ent('kgtallow', x0, y1, { id }); return d; };
  /* A MEAT-HOOK RAIL (src/zipline.js): rows are the FEET rows at each end (the Ksar's lineRope): its high end hangs a reach over the lip you take it from */
  const hookRail = (x0, r0, x1, r1, o) => { const z = Object.assign({ x0: x0 * TS + 8, y0: (r0 + 1) * TS - 22, x1: x1 * TS + 8, y1: (r1 + 1) * TS - 12, hooks: true, speed: 200, meat: true }, o || {});
    z.dir = z.dir ?? ((z.y1 - z.y0) * (z.x1 - z.x0) > 0 ? 1 : -1); zipLines.push(z); return z; };   /* (claude/kitchengate2) MEAT-HOOK RAILS: chain-driven, they run one way (their low end) - hooks and carcasses ride them */
  const page = (x, y) => { pages.push([x, y]); ent('kgpage', x, y, { n: pages.length }); };

  block(0, W - 1, 0, H - 1);   /* THE CASTLE'S ROCK: every hall is carved out of it (no floating masonry: walls, floors and vaults are the rock itself) */

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

  // ================= 3. THE GREASE KITCHENS (201-300): REMIX - grease, and the fire on it =================
  air(201, 300, 8, 23);                                                                  /* THE GREASE KITCHENS (floor row 24) */
  sign(203, 23, 'THE GREASE KITCHENS. ON GREASE YOU SLIDE: SLOW TO GET GOING, SLOWER TO STOP.');
  slick.push([202, 216, 24]);
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
  slick.push([246, 282, 24]);
  air(262, 264, 24, 25); spike(262, 264, 26);
  shelf(249, 251, 21); shelf(252, 256, 18); page(254, 17);                                /* the racks up to the rail; RECIPE PAGE THREE on the top one */
  hookRail(256, 17, 281, 23);
  const race = { x0: 246, x1: 283, f: 24, trig: 249, pot: [247, 23], v: 66, behind: 2.6 };
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
  /* THE HEARTH TRENCH on the hooks (REQUIRED) */
  air(323, 340, 22, 25); spike(323, 340, 26);
  hookRail(322, 15, 342, 21);
  sign(316, 15, 'THE HEARTH TRENCH. TAKE A HOOK OFF THE GALLERY.');
  /* THE BUTTERY DOOR (REQUIRED): grease, a butcher on the trail, a thrower on the dresser, a cook - and the door at the trail's end */
  slick.push([341, 354, 22]);
  block(353, 360, 6, 12);                                                                /* the wall over the buttery door */
  const stove3 = fire('stove3', 343, 21, 345, 22);
  const door2 = tallow('door2', 355, 356, 13, 21);
  trail(stove3, 'trail3', 346, 354, 22, door2);
  foe('butcher', 350, 21, 'buttery', { face: -1 }); shelf(346, 349, 18); foe('attendant', 347, 17, 'buttery', { face: 1, perch: true }); foe('sprig', 352, 21, 'buttery', { face: -1 });
  sign(342, 21, 'THE BUTTERY DOOR.');
  coins([344, 21], [358, 21], [361, 21]);
  /* THE SPICE VAULT: a cellar under the floor behind an iron grate; the head cook's three recipe pages open it (silver) */
  air(359, 366, 24, 27); shelf(362, 363, 25);
  const vault = { x0: 362, x1: 363, y0: 22, y1: 23, need: 3 };
  ent('kgvault', 362, 21, {}); ent('silver', 365, 27);
  sign(361, 21, "THE SPICE VAULT. THE HEAD COOK'S THREE RECIPE PAGES OPEN ITS GRATE.");
  foe('hearthgob', 364, 21, 'vaultDoor', { face: -1 });
  ent('check', 368, 21);                                                                 /* SHRINE FOUR: his door */
  prop('oven', 302, 22); prop('spices', 318, 16); prop('basin', 344, 22); prop('hatch', 366, 22); prop('flour', 358, 22);
  sign(370, 21, 'HE NEVER LEAVES HIS CHAIR. EVERY DISH THAT REACHES HIM HEALS HIM: KNOCK THEM OFF THE LINE. LET THE BOMBS REACH HIM.');

  /* THE KITCHEN SHELVES: pot racks and dressers along the walls (a second height, coins on them) - never where one would climb a face a machine is for */
  for (const [a, b, y] of [[24, 27, 34], [58, 61, 23], [84, 86, 22], [93, 97, 15], [150, 153, 7], [157, 161, 10], [196, 199, 10], [212, 216, 20], [241, 244, 19], [259, 262, 19], [266, 270, 19], [292, 296, 20], [362, 366, 18]]) { shelf(a, b, y); racks.push([a, b, y]); ent('coin', Math.round((a + b) / 2), y - 1); }

  // ================= 5. GRUBBAG'S TABLE (374-428): LORD GRUBBAG THE GLUTTON =================
  /* The high table's hall: the floor (row 22), his reinforced chair at the east end hard against the wall (claude/grubbagbig: he is ~225 px across now and fills it), the high table
     under his belly, the KITCHEN HATCH high in the west wall over its PIE OVEN, the oven's bellows, and THE SERVING LINE - a hook rail under the roof from the hatch to his table (the
     dishes ride it). Two benches along the hall, and THE GALLERY (a shelf two benches up, west of his table): from it a hero can come down on his belly (a plunge, GB.above). */
  /* (claude/kitchengate2, Daniel 10-27) HE SITS AT THE HEAD OF THE SERVING LINE: a conveyor counter two rows up (one-way: you jump up onto it, it carries you toward him) from the
     kitchen hatch to his platter; two shelves over it (the lob lands on whatever you stand on); the pepper stove and its bellows by the hatch; the grease cauldron hung on a chain
     over the line's end. The table is the line's own end (his platter). */
  const [A0, A1] = KITCHEN.arena, FL = KITCHEN.floor, RF = KITCHEN.roof;
  air(373, A0 - 2, 12, FL - 1);                                                          /* the passage from the feast hall to his table */
  /* (claude/kitchengate2) THE SERVING PASSAGE (the belt's and the flare's EXAM, and the approach that sets him up - B8): his own serving line runs east into his hall, two griddles
     set in it flare in turn, dishes and bombs ride it to him, and an attendant stands on it */
  belt('passageLine', 374, 387, FL, 1, { v: 36, every: 2.6, bomb: 3 }); flare('passGriddle1', 377, 378, FL, { period: 2.4, phase: 0 }); flare('passGriddle2', 383, 384, FL, { period: 2.4, phase: 1.2 });
  sign(373, FL - 1, 'HIS SERVING LINE. EVERY DISH ON IT GOES TO HIM.'); foe('attendant', 386, FL - 1, 'passage', { face: -1 }); prop('hatch', 388, FL);
  air(A0 - 1, A1 + 1, RF, FL - 1);
  const BELT = [A0 + 7, A1 - 16, FL - 2], PLATS = [[A0 + 9, A0 + 12, FL - 5], [A0 + 16, A0 + 19, FL - 5]];
  shelf(BELT[0], BELT[1], BELT[2]); for (const [a, b, y] of PLATS) shelf(a, b, y);
  ent('torch', A0 + 1, FL - 1); ent('torch', A1 - 18, FL - 1);
  ent('grubbag', A1 - 7, FL - 1);

  const arena = { x0: A0 * TS, x1: (A1 + 1) * TS, floor: FL * TS, y0: RF * TS, trigger: (A0 + 6) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'grubbag', music: 'grubbag', tint: '#f0c890', tintA: 0.06,
    /* THE TABLE (src/grubbag.js geom): his chair's column, his platter (the line's end), the pepper stove and its bellows, THE SERVING LINE (the conveyor: first and last column,
       its top row), the shelves, the grease cauldron's hook (column, row) */
    chair: A1 - 7, table: [A1 - 18, A1 - 15], oven: A0 + 2, bellows: A0 + 5, belt: BELT, plats: PLATS, cauldron: [A1 - 17, 13] };
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 39 }, pools: [], falls: [],
    arena, kitchen: true, kgKit: true, hoists, kgFires: fires, kgPots: pots, kgWheels: wheels, kgTrails: trails, kgDoors: doors, kgRace: race, kgPages: pages, kgVault: vault, kgRacks: racks,
    zipLines, slick, reachVents, moversExtra: movers, kgBelts: belts, kgFlares: flares, kgProps: props,
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 260,                  /* four shrines, one closing each area's exam (A10c): src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: A0, hi: W - 1, spots: 0, why: "GRUBBAG'S TABLE: the boss's hall - no squad stands in a boss arena" }, { lo: 400, hi: W - 1, spots: 0, why: "GRUBBAG'S TABLE, section 3 (sprinkle-cap keys a band on its section start, 400): the same hall" }],
    unlocks: [
      { kind: 'hoists', opens: 'a lift (the copper\'s steam), a ride up (the great spit), a door (the grease burns to the tallow door and melts it)', hud: 'THE FIRE ROARS' },
      { kind: 'kgpage', opens: 'secret', hud: 'RECIPE PAGES n/3: THE SPICE VAULT' },
    ],
    duskStart: -1, duskLen: 1, music: 'kitchengate', night: false, glowNight: false,
    interiors: [[1, 72, 28, 46, 'cellar'], [56, 104, 9, 26, 'cellar'], [105, 200, 4, 28, 'keep'], [201, 300, 8, 27, 'keep'], [300, 388, 6, 27, 'royal'], [389, 430, 6, 21, 'royal']],   /* INSIDE THE CASTLE: every hall has a back wall, never the sky (the art lane gives each its own) */
    palette: { hall: true, sky: 'night', dress: 'none', ledges: 'beam', haze: 'rgba(255,170,90,0.10)', dirt: '#5e4a3a', dirtL: '#7a6450', dirtD: '#3a2c22', grass: '#8a7058', grassL: '#a88a6a', grassD: '#5a4636' },
    ambient: [{ x0: 0, x1: 99999, kind: 'cave' }],
    tints: [[-24, 104, [180, 190, 210], 0.07], [104, 201, [255, 200, 150], 0.07], [201, 300, [255, 210, 160], 0.07], [300, 372, [255, 215, 170], 0.06], [372, W + 24, [255, 200, 140], 0.08]],
    reachExact: false,
  };
}
