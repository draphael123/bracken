// src/towpath.js - THE TOWPATH, the road inland: the bridge level WAYMEET -> THE TOWPATH -> THE FOG CANAL (claude/towpath, the OPUS GREYBOX, 2026-10-08:
// geometry, the locks, the swing bridges, the lantern in the fog, the encounters, the wiring; greybox art only - no art pass until the review).
// Concept: scratch/concept-towpath.md (Daniel 10-07, interview 10-08: "the turn from Waymeet to the Fog Canal is sudden" - a transition, Waymeet's dusk
// fading to the canal's brick and fog; THE FOG KNIGHT approved as its boss, no mini). Main road: waymeet > TOWPATH > canal. At its start a LYCHGATE FORK:
// the hill path to THE LIT CHURCH (claude/litchurch builds it - the 'tpchurch' door is the hook, src/towpath-hands.js enterChurch) and the river path on.
//
// THE RULE: THE LOCKS LIFT THE WATER, AND THE WATER LIFTS YOU.
// A LOCK is a chamber of water between two gates. Its PADDLE (strike it, or E beside it) sets the chamber FILLING or DRAINING; the water moves at TP.fill px/s.
// What floats in it - a moored PUNT, a barrel - rides the surface: filled, it lifts you to the upper bank; drained, it brings the punt down to you, and a
// drained chamber is a floor (and, in the exam, a bed of old gate irons). A LOWER GATE stands open only while its chamber is down at its lower pound: a lock
// you fill shuts the way you came. A man standing in a chamber that fills is DROWNED (main.js hazardFoe). src/towpath-hands.js is the rule's code;
// tools/towpath.mjs holds this header's rule line equal to LEVELS' and checks each verb's arc.
// THE OTHER VERBS: THE SWING BRIDGE (a capstan, struck or E, swings its deck across the cut or clear of it - a squad on it goes in the water) and THE
// LANTERN (the lock-keeper's, taken at his hut: E with nothing else in reach lights or dims it). In the fog a WATCHMAN looses only at what is lit and a
// dozing BARGEMAN wakes only to a lit hero (or one at his elbow); lit, you see the fog's edges and they see you - dim, you slip past half-blind. The mill's
// WHEEL turns while its RACE runs: drain the race and the wheel stands still, its paddles a stair.
//
// SEVEN SECTIONS (design columns; rows below are DESIGN rows, the sheet is laid O rows lower):
//   0-39     THE LYCHGATE         FORK     the last of Waymeet's lane; the lychgate: up the hill to THE LIT CHURCH, down the bank to the river
//   40-95    THE MILL-POND LOCK   TEACH    the first lock (soft: its low water only wets you): onto the punt, strike the paddle, ride up
//   96-160   THE MILLS            TEST     drain the race and climb the stilled wheel under the loft's crossbow; THE TAIL RACE's swing bridge (teach);
//                                          the hedge-knight champion at the bridge's end (the section's exam), the lock-keeper's hut: THE LANTERN
//   161-221  THE LOCK FLIGHT      SET PIECE three locks up the hill as the fog comes in: DRAIN to bring the moored punt down (F1); FILL to drown the
//                                          pair in the dry chamber - or fight them in it (F2); ride up in the fog under a watchman, dim (F3)
//   222-264  THE BASIN            REMIX    thick fog: the basin's swing bridge strands a crossing squad; the warehouse roofs under a watchman
//   265-315  THE LAST LOCK        EXAM     drain / cross / refill / swing at night: chamber X drained to its ledges over the old gate irons (a fall
//                                          is the end), the culvert, chamber Y refilled under a bargeman's hook, the last cut swung across to the
//                                          deck foreman (the exam's elite) - and the shrine after it
//   316-360  THE TOWPATH'S END    BOSS     THE FOG KNIGHT (src/fog-knight.js stageFogKnight), at the barge mooring that opens THE FOG CANAL
import { stageFogKnight, FK_STAGE } from './fog-knight.js';

export const O = 10;   /* the sheet is laid O rows lower than the design rows written here (headroom over the flight and the boss's towpath) */
export const TOWPATH = { W: 361, H: 60 };
export const RULE = 'THE LOCKS LIFT THE WATER, AND THE WATER LIFTS YOU.';
export const SECTIONS = [['THE LYCHGATE', 0], ['THE MILL-POND LOCK', 40], ['THE MILLS', 96], ['THE LOCK FLIGHT', 161], ['THE BASIN', 222], ['THE LAST LOCK', 265], ["THE TOWPATH'S END", 316]];
/* each verb's arc (design columns) - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/towpath.mjs */
export const ARCS = {
  lock: { teach: [47, 56], test: [99, 110], remix: [160, 183], exam: [265, 293], boss: [316, 360] },     /* the mill-pond lock; the millrace (drain); the flight (drain, drown, ride); X and Y */
  bridge: { teach: [129, 139], test: [219, 237], exam: [294, 303], boss: [316, 360] },                   /* the tail race (safe); the basin (strand the squad); the last cut; the scatter */
  lantern: { teach: [153, 183], test: [222, 264], exam: [265, 315], boss: [316, 360] },                 /* the hut and the flight's watchman; the basin's dozers and the roofs; X's watchman; the burn */
};

export function buildTowpath({ painter, T, TS }) {
  const { W, H } = TOWPATH;
  const L = painter(W, H);
  /* THE DESIGN-ROW HANDS: every row below is a design row, laid O rows lower */
  const set = (x, y, v) => L.set(x, y + O, v);
  const block = (x0, x1, y0, y1) => L.block(x0, x1, y0 + O, Math.min(H - 1, y1 + O));
  const ent = (t, x, y, o) => L.ent(t, x, y + O, o || {});
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const ground = (x0, x1, top) => block(x0, x1, top, H - 1 - O);
  const boards = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const nets = [], ladder = (x, y0, y1) => nets.push([x, y0, y1]);   /* every ladder is hung LAST, over what is carved */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const R = r => (r + O) * TS;   /* a design row's top, in px */
  /* THE CAST (every one a proven machine under a skin; src/towpath-hands.js gives the bargemen and watchmen their eyes in the fog via `tp`) */
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ face: -1, squad }, o || {}));
  const sworn = (x, y, squad, o) => foe('swornsword', x, y, squad, o);                                                   /* WAYMEET's sworn swords, still on the lane */
  const hedge = (x, y, squad, o) => foe('hedgeknight', x, y, squad, o);                                                  /* WAYMEET's hedge knights (heavy) */
  const crossbow = (x, y, squad, o) => foe('crossbow', x, y, squad, o);                                                  /* WAYMEET's crossbowmen (ranged), on the mill */
  const bargeman = (x, y, squad, o) => foe('gaffer', x, y, squad, Object.assign({ cnSkin: 'bargeman', tp: { bargee: true } }, o || {}));   /* THE BARGEMAN: the Ore Road's gaffer under the canal's man (his boathook pulls you toward the water) */
  const riverrat = (x, y, squad, o) => foe('gaffer', x, y, squad, Object.assign({ cnSkin: 'riverrat', tp: { bargee: true } }, o || {}));
  const watchman = (x, y, squad, o) => foe('archer', x, y, squad, Object.assign({ cnSkin: 'watchman', tp: { tpSight: true } }, o || {}));   /* THE WATCHMAN: in the fog he looses only at what is lit */
  const grindy = (x, surf, squad) => ent('grindylow', x, surf - 1, { squad, face: -1 });                                  /* THE GRINDYLOW: the canal's weed-imp, met here first (the level's one new foe) */

  /* THE RULE'S PIECES (src/towpath-hands.js reads them off L.towpath): locks, punts, paddles, swing bridges, capstans, the mill wheel, fog, lamps, the fork */
  const locks = [], bridges = [], wheels = [], fogs = [], lamps = [], moversExtra = [], rigBands = [], pools = [], interiors = [], decor = [];
  /* A LOCK: chamber columns x0..x1, its bed row (solid from there down), its two water levels (surface rows: lo is the lower pound's, hi the upper's; lo === bed
     is a chamber that drains DRY), the level it starts at, its LOWER GATE (column, rows top..bot: solid while the water stands over its lower pound), and
     whether its low water only wets you (shallow: the teach). Its water is an engine pool whose surface src/towpath-hands.js moves */
  const lock = (id, x0, x1, bed, lo, hi, init, o = {}) => {
    air(x0, x1, Math.min(lo, hi) - 3, bed - 1); block(x0, x1, bed, H - 1 - O);
    const y = (init === 'hi' ? hi : lo) * TS + R(0) + 4;
    pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: Math.min(y, R(bed)), shallow: false, swim: false, clear: true, bottom: R(bed), tp: id, dry: init !== 'hi' && lo >= bed });
    locks.push(Object.assign({ id, x0, x1, bed: bed + O, lo: lo + O, hi: hi + O, init, pool: pools.length - 1, gate: o.gate ? { x: o.gate[0], top: o.gate[1] + O, bot: o.gate[2] + O } : null, shallowLo: !!o.shallowLo, race: !!o.race }));
    return id; };
  /* A PUNT moored in a lock (columns x0..x0+w-1): a mover whose deck rides the chamber's water (on its bed when it is dry) - and for the reach model, a ride from lo to hi */
  const punt = (id, x0, w = 4) => { const k = locks.find(q => q.id === id); moversExtra.push({ kind: 'punt', towpath: id, x: x0 * TS, y: 0, w: w * TS, h: 8 });
    rigBands.push([x0, x0 + w - 1, k.hi - 0, Math.min(k.lo, k.bed - 1)]); };
  const paddle = (x, y, id, o) => ent('tppaddle', x, y, Object.assign({ lock: id }, o || {}));
  /* A SWING BRIDGE: a deck of one-way boards across the cut at row, x0..x1; 'across' or 'open' to start; its capstans [[x, y], ...] (each on a bank) */
  const bridge = (id, x0, x1, row, init, caps) => { bridges.push({ id, x0, x1, row: row + O, init }); if (init === 'across') boards(x0, x1, row); for (const [cx, cy] of caps) ent('tpcapstan', cx, cy, { bridge: id }); };
  /* a plain pound (deep, one level): the tail race, the basin, the last cut - water you fall into */
  const pound = (id, x0, x1, bed, surf) => { air(x0, x1, surf - 6, bed - 1); block(x0, x1, bed, H - 1 - O); pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: R(surf) + 4, shallow: false, swim: false, clear: true, bottom: R(bed), tp: id }); };
  const fog = (x0, x1, a, o) => fogs.push(Object.assign({ x0, x1, a }, o || {}));   /* a fog band: its thickness a (0..1) where the lantern is not; `rises` thickens it with the night */
  const lamp = (x, y, lit) => { lamps.push({ x, y: y + O, lit: !!lit }); ent('tplamp', x, y, { lit: !!lit }); };   /* a lamp post on the towpath: struck, lit or put out */

  // ================= 0. THE LYCHGATE (0-39): THE FORK =================
  /* WAYMEET's last lane, at dusk. The first screen asks: which way - up the hill to the lit church on its hill, or down the bank to the river. The lychgate
     is the CHURCH's own (its roof and lamp, src/towpath-hands.js draws it), not Waymeet's (A8) */
  ground(0, 17, 34);
  sign(3, 33, 'THE TOWPATH. THE RIVER ROAD OUT OF WAYMEET.');
  ent('tplychgate', 13, 33);
  /* THE HILL PATH: four steps up to the church's lane (the hook: src/towpath-hands.js enterChurch - THE LIT CHURCH is claude/litchurch's level) */
  boards(17, 20, 31); boards(22, 25, 28); boards(27, 30, 25); boards(32, 39, 22);   /* (the church lane: stone steps up the hill, drawn as the hill's own) */
  sign(15, 33, 'UP THE HILL: THE LIT CHURCH. DOWN THE BANK: THE RIVER AND THE LOCKS.');
  ent('tpchurch', 38, 21, { to: 'church' });
  coins([23, 27], [28, 24]);
  /* THE RIVER PATH: down the bank to the towpath (two drops), the first of Waymeet's sworn swords on the bank */
  ground(18, 23, 36); ground(24, 46, 38);
  sworn(42, 37, 'theBank', { face: -1 });
  decor.push({ kind: 'milestone', x: 26, y: 37 + O }, { kind: 'willow', x: 30, y: 37 + O });
  boards(27, 34, 35);   /* (the willow's bough over the bank: a second height) */

  // ================= 1. THE MILL-POND LOCK (40-95): TEACH - onto the punt, strike the paddle, ride up =================
  /* the lower gate (col 47) stands open at the low water; the chamber (48-55) is a mill pond's lock: its low water only wets you (shallow - the teach), its
     high water is the upper bank's level (row 34). Four rows up: no jump makes it - the lock does. The PADDLE stands on the chamber's east wall, struck from the punt */
  block(47, 47, 38, H - 1 - O);
  lock('A', 48, 55, 44, 40, 34, 'lo', { gate: [47, 33, 37], shallowLo: true });
  punt('A', 51, 4); paddle(55, 39, 'A'); paddle(46, 37, 'A');   /* (its twin on the lower bank: a punt that rode up without you comes back down) */
  sign(45, 37, 'A LOCK. ITS PADDLE FILLS IT, AND THE WATER LIFTS THE PUNT.');
  ground(56, 99, 34);
  /* THE UPPER BANK: a hedge knight waits where the punt lets you off - the lock at your back */
  hedge(60, 33, 'lockTop', { face: -1 });
  /* THE COTTAGE: a crossbowman on its roof over the bank, a sworn sword on the stile */
  block(67, 75, 29, 29); block(67, 67, 30, 31); block(75, 75, 30, 31);   /* (its roof a ledge over the bank, its walls hung from it: you walk under) */ interiors.push([69, 73, 30 + O, 33 + O, 'tpCottage']);
  crossbow(72, 28, 'cottage', { face: -1 }); boards(64, 66, 31);   /* (a water butt by its wall: the step up onto the roof) */
  ground(80, 83, 32); sworn(82, 31, 'cottage', { face: -1 });
  coins([74, 28], [88, 33]); ent('silver', 70, 28);   /* (the cottage roof: a silver, up the water butt under the crossbow) */
  boards(84, 92, 30);   /* (the hay loft's lip over the bank: a second height) */
  decor.push({ kind: 'cattle', x: 62, y: 33 + O }, { kind: 'milestone', x: 90, y: 33 + O });

  // ================= 2. THE MILLS (96-160): TEST - the race and the wheel; the tail race's swing bridge =================
  /* THE MILLRACE: the race pit (100-108) between the towpath and the mill. While the race RUNS the wheel turns - its blades in the pit, no footing on it; DRAIN
     the race (its paddle on the bank) and the wheel stands still: its paddles are a stair (src/towpath-hands.js sets the cells) up to the mill's loft */
  lock('race', 100, 108, 44, 43, 35, 'hi', { race: true });
  paddle(98, 33, 'race');
  sign(96, 33, 'THE RACE TURNS THE WHEEL. ITS PADDLE IS ON THE BANK.');
  wheels.push({ id: 'mill', race: 'race', cx: 105, cy: 31 + O, r: 4, steps: [[100, 101, 31 + O], [102, 103, 28 + O], [105, 106, 26 + O]] });
  ground(109, 128, 27);   /* THE MILL: its loft floor */
  interiors.push([110, 127, 20 + O, 26 + O, 'tpMill']); block(109, 128, 19, 19); block(128, 128, 20, 23);   /* its roof, its east wall to the door (24-26) */
  crossbow(120, 26, 'loft', { face: -1 }); sworn(114, 26, 'loft', { face: -1 });   /* the loft's crossbow covers the wheel climb */
  /* THE YARD and THE TAIL RACE: a drop from the loft's door to the yard; the cut (132-138) too wide to jump; its SWING BRIDGE stands clear of it - its capstan on
     this bank swings it across (taught safe: nobody on the far side) */
  ground(129, 131, 32);
  pound('tail', 132, 138, 42, 33);
  bridge('tail', 132, 138, 32, 'open', [[130, 31]]);
  sign(129, 31, 'THE SWING BRIDGE. ITS CAPSTAN TURNS IT ACROSS THE CUT.');
  grindy(138, 33, 'tailRace');   /* THE FIRST GRINDYLOW, alone under the far bank's lip: ripples at the edge (the canal's imp, met here first) */
  ground(139, 160, 32); boards(141, 148, 28);   /* (the mill yard's drying rack: a second height) */
  sign(140, 31, 'RIPPLES AT THE WATER\'S EDGE: SOMETHING IS UNDER. JUMP IT, OR STRIKE THE RIPPLE.');
  /* THE MILLS' EXAM: a HEDGE KNIGHT CHAMPION on the bank where the bridge lets you off - the cut at your back */
  hedge(145, 31, 'millExam', { face: -1, elite: true });
  /* THE LOCK-KEEPER'S HUT: the shrine after the exam, and THE LANTERN on its hook (E takes it) */
  ent('check', 151, 31);
  block(153, 158, 27, 27); block(153, 153, 28, 29); block(158, 158, 28, 29); interiors.push([154, 157, 28 + O, 31 + O, 'tpHut']);
  ent('tplantern', 156, 31);
  sign(154, 31, 'THE LOCK-KEEPER\'S LANTERN. E LIGHTS IT, OR DIMS IT. IN THE FOG IT SHOWS YOU THE WAY - AND SHOWS YOU.');
  coins([147, 31], [159, 31]);

  // ================= 3. THE LOCK FLIGHT (161-221): THE SET PIECE - three locks up the hill as the fog comes in =================
  /* F1: moored at the TOP. The chamber is full and its lower gate shut; the punt rides high, out of reach. Its BANK PADDLE drains it: the punt comes down,
     the gate opens; aboard, its chamber paddle fills it again and you ride up. (Drain, then fill: the rule both ways) */
  block(160, 160, 32, H - 1 - O);
  lock('F1', 161, 166, 38, 33, 27, 'hi', { gate: [160, 26, 31] });
  punt('F1', 161, 4); paddle(159, 31, 'F1'); paddle(166, 32, 'F1');
  ground(167, 168, 27);
  /* F2: DRY, and a pair of bargemen on its bed with the punt. Drop in and fight them in the pit - or FILL it from the landing and the water takes them
     (then drain it for the punt). The bed paddle lifts you either way */
  lock('F2', 169, 174, 33, 33, 22, 'lo', { gate: [168, 22, 26] });
  punt('F2', 169, 4); paddle(167, 26, 'F2'); paddle(174, 32, 'F2');
  bargeman(171, 32, 'dryChamber', { face: -1 }); bargeman(173, 32, 'dryChamber', { face: -1 });
  ground(175, 176, 22);
  /* F3: in the fog. A watchman on the top gate's beam over it looses only at a lit hero; a grindylow in its water. Ride it up dim */
  lock('F3', 177, 182, 28, 23, 17, 'lo', { gate: [176, 17, 21] });
  punt('F3', 177, 4); paddle(182, 22, 'F3'); paddle(175, 21, 'F3');
  grindy(181, 23, 'flightTop');
  boards(183, 188, 13); watchman(186, 12, 'flightTop', { face: -1 }); ent('silver', 184, 12);   /* (the top gate's beam: a silver behind the watchman) */
  boards(195, 212, 13);   /* (the flight's footbridge over the top pound's bank: a second height) */
  ground(183, 221, 17);
  fog(156, 221, 0.35, { rises: 0.25 });   /* THE FOG COMES IN up the flight: thin at the hut, thickening as the night does */
  lamp(163, 26, true); lamp(189, 16, false);
  /* the top of the flight: a bargeman dozing on his bollard in the fog, a lamp you can douse */
  bargeman(200, 16, 'flightTopDozer', { face: -1, tp: { bargee: true, tpDoze: true } });
  coins([186, 16], [194, 16], [210, 16]);
  decor.push({ kind: 'bollard', x: 199, y: 16 + O }, { kind: 'milestone', x: 214, y: 16 + O });

  // ================= 4. THE BASIN (222-264): REMIX - the bridge strands the squad; the roofs under the watchman =================
  /* THE BASIN: a wide pound (222-234), its SWING BRIDGE across it with a capstan on each bank. A squad of river rats dozes in the thick fog on the far bank:
     lit, they wake and come across - swing the deck clear under them and the basin takes them. Then swing it back and cross */
  pound('basin', 222, 234, 26, 18);
  bridge('basin', 222, 234, 17, 'across', [[220, 16], [236, 16]]);
  grindy(224, 18, 'basinW'); grindy(233, 18, 'basinE');
  ground(235, 265, 17);
  riverrat(240, 16, 'basinSquad', { face: -1, tp: { bargee: true, tpDoze: true } }); riverrat(243, 16, 'basinSquad', { face: -1, tp: { bargee: true, tpDoze: true } });
  fog(222, 265, 0.6, { rises: 0.2 });
  lamp(237, 16, true);
  /* THE WAREHOUSES: brick, the canal town's first. Over the roofs (a ladder up the first's face); the alley under the gap is a pocket (a silver, a ladder out) */
  block(246, 252, 12, 16); ladder(245, 11, 16); interiors.push([247, 251, 13 + O, 16 + O, 'tpWarehouse']);
  block(256, 264, 12, 16); interiors.push([257, 263, 13 + O, 16 + O, 'tpWarehouse']);
  air(253, 255, 9, 16); ladder(253, 11, 16); ent('silver', 254, 16);
  bargeman(250, 11, 'roofs', { face: -1, tp: { bargee: true, tpDoze: true } });
  watchman(261, 11, 'roofs', { face: -1 });
  coins([248, 11], [254, 10], [258, 11]);

  // ================= 5. THE LAST LOCK (265-315): THE EXAM - drain / cross / refill / swing, at night =================
  /* X: full to the brim. Its BANK PADDLE drains it, and the drained chamber is ledges over THE OLD GATE IRONS - a fall onto them is the end (the exam: told as
     you walk in). Down the ledges to THE CULVERT under the east wall, under a watchman on the rim */
  ground(265, 267, 17);
  lock('X', 268, 279, 27, 27, 18, 'hi');
  for (let x = 268; x <= 279; x++) set(x, 26, T.SPIKE);
  boards(269, 270, 20); boards(272, 273, 22); boards(275, 276, 24);
  paddle(266, 16, 'X');
  sign(265, 16, 'THE LAST LOCK. DRAINED, ITS BED IS THE OLD GATE IRONS.');
  block(280, 284, 14, 22); air(280, 284, 23, 25); block(280, 284, 26, 26);   /* the east wall over THE CULVERT (rows 23-25) into Y */
  interiors.push([280, 284, 23 + O, 25 + O, 'tpCulvert']);
  watchman(282, 13, 'xRim', { face: -1 });
  /* Y: dry, its punt on the bed. Its bed paddle REFILLS it: the punt rides up thirteen rows to the upper bank - where a bargeman waits to hook you off it */
  lock('Y', 285, 292, 27, 27, 14, 'lo');
  punt('Y', 286, 4); paddle(290, 26, 'Y'); paddle(283, 25, 'Y');   /* (and one on the culvert's floor: a punt that rode up without you comes back down) */
  block(293, 296, 14, H - 1 - O);
  bargeman(295, 13, 'yTop', { face: -1 });
  /* THE LAST CUT: its bridge stands clear; the capstan on this bank swings it across - to THE DECK FOREMAN (the exam's elite) and a watchman */
  pound('cut', 297, 301, 22, 15);
  bridge('cut', 297, 301, 14, 'open', [[296, 13]]);
  ground(302, 315, 14); boards(304, 311, 10);   /* (the warehouse crane's jib over the last bank) */
  bargeman(306, 13, 'foreman', { face: -1, elite: true, cnSkin: 'deckforeman' }); watchman(311, 13, 'foreman', { face: -1 });
  fog(265, 315, 0.7, { rises: 0.15 });
  lamp(267, 16, false); lamp(303, 13, true);
  ent('check', 313, 13);   /* THE SHRINE AFTER THE EXAM, and before him */
  coins([270, 19], [276, 23], [304, 13]);

  // ================= 6. THE TOWPATH'S END (316-360): THE FOG KNIGHT =================
  const AX = 316, AR = 14;
  const stage = stageFogKnight({ set, block, ent, air, boards }, T, TS, AX, AR);
  stage.carve();
  pools.push(...stage.pools); bridges.push(...stage.bridges.map(b => ({ ...b, row: b.row + O }))); lamps.push(...stage.lamps.map(l => ({ ...l, y: l.y + O }))); locks.push(...stage.locks.map(k => ({ ...k, bed: k.bed + O, lo: k.lo + O, hi: k.hi + O })));
  fog(AX, W - 1, 0.5, { arena: true });
  block(AX + FK_STAGE.W, W - 1, 0, H - 1 - O);
  ent('gate', AX + FK_STAGE.W - 2, AR - 1);

  // ================= THE LADDERS, LAST =================
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);
  /* the top rows of the sheet over the land are open sky (O rows of headroom) */

  const START = { x: 2, y: 33 + O };
  const arena = stage.arena;
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools, falls: [], moversExtra, rigBands, interiors, arena, gateAfterBoss: true,
    towpath: { O, locks, bridges, wheels, fogs, lamps, decor, arcs: ARCS, sections: SECTIONS, lantern: { x: 156, y: 31 + O }, fork: { church: 'church', door: [37, 21 + O], lych: [13, 33 + O] } },
    waterHurts: true, noWade: true,   /* the locks' and the cuts' deep water bites (A10: ~27% and back to the bank) and is no floor to the reach model - the punts (rigBands) are */
    examSpans: [[268, 301]],          /* THE LAST LOCK: the old gate irons kill (told as you walk in: src/survival.js examAt) */
    calm: [[0, W - 1, 0, H - 1]],     /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,
    squadBands: [{ lo: AX, hi: W - 1, spots: 0, why: "THE FOG KNIGHT's towpath: no squad stands in a boss arena" }],
    unlocks: [
      { kind: 'tppaddle', opens: 'the chamber filling or draining: the punt to the upper bank, the lower gate, the wheel stilled', hud: 'THE PADDLE IS UP: THE CHAMBER FILLS. THE PUNT RIDES THE WATER UP.' },
      { kind: 'tpcapstan', opens: 'the swing bridge across the cut (or clear of it, and whoever stands on it)', hud: 'THE CAPSTAN TURNS: THE BRIDGE SWINGS ACROSS THE CUT.' },
      { kind: 'tplantern', opens: 'the lantern: lit, the fog shows its edges (and you); dim, the watchmen cannot see you', hud: 'THE LOCK-KEEPER\'S LANTERN: E LIGHTS IT, OR DIMS IT.' },
      { kind: 'tplamp', opens: 'a lamp on the towpath: lit, it burns the fog off round it', hud: 'A LAMP ON THE TOWPATH: STRUCK, IT LIGHTS - OR GOES OUT.' },
      { kind: 'tpchurch', opens: 'the hill path to THE LIT CHURCH', hud: 'THE HILL PATH: THE LIT CHURCH.' } ],
    music: 'towpath', duskStart: 0.3, duskLen: 0.55,
    palette: { set: 'village', dress: 'village', ledges: 'staging', sky: 'dusk', far: 'town', mid: 'town', near: 'town', nearSet: 'town',
      haze: 'rgba(170,175,180,0.16)', murkCol: '#262a34',
      grass: '#5e7a44', grassL: '#7f9c5a', grassD: '#3e5430', dirt: '#6a5a48', dirtL: '#7f6c58', dirtD: '#463a2c',
      canopy: ['#24302a', '#304432', '#3e5640', '#4e6a4a'] },
    weather: [], ambient: [{ x0: 0, x1: 95 * TS, kind: 'town' }, { x0: 95 * TS, x1: 99999, kind: 'towpath' }],
  };
}
