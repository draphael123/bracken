// src/sealed-pyramid.js - THE SEALED PYRAMID, desert act, main road past THE BURIED CITY (claude/sealedpyramid, the OPUS GREYBOX, 2026-10-12).
// Brief: scratch/brief-sealedpyramid.md (Daniel's concept interview 10-11, recs) + the desert-arc concept (bracken/.claude/briefs/desert-arc-concept-2026-10-01.md:
// L6, the mummy its one new foe, the tomb dart-blowers its ranged reskin, the scarab seals its key, THE SCARAB MOTHER its boss, NO MINI - the Embalmer is cut and
// his hall is a test room). The draft (src/draft/sealed-pyramid.js) gave the structure - a DESCENT through galleries of traps and plates, counterweight shafts
// in the middle, the false tomb, the scarab pits, the deep way - and this builds it in the real level system, to today's rules (design standard A1-A13, B1-B16).
// ART IS PLACEHOLDER (greybox, readable): the SONNET art lane draws the kit (the list is in work/claude/lane-done/claude-sealedpyramid.md) - ART BEFORE LIVE.
// Main road: buriedcity > THE SEALED PYRAMID (needs 'buriedcity') > kingspyramid (not built yet).
//
// THE RULE: THE TOMB IS A MACHINE: TREAD A PALE PLATE AND ITS TRAP FIRES ON WHATEVER STANDS IN ITS REACH - LET THE GUARDS STAND THERE, NOT YOU.
// Every gallery has a TRAP (a FALLING BLOCK from a slot in the ceiling, a DART WALL, a ROLLING STONE in its groove) and a PRESSURE PLATE (a pale, worn flag in
// the floor) that fires it. THE PLATE STANDS BEFORE THE TRAP'S REACH, and a GUARD walks in the reach: tread the plate as the guard walks into it and the tomb
// kills its own. Some reaches have plates IN them too - tread one of those while YOU are in the reach and it fires on you (jump the pale stones). A mummy's
// tread presses a plate as surely as yours (src/mummy.js: it is heavy; a scarab is not). Traps RESET behind you (the block hauls back up into its slot, the
// darts reload, the stone is wound back into its niche). THE STATE IS DRAWN (A3): the plates are pale and worn where the robbers stepped; every reach is
// SCORED on the stone (block dust and a shadow under the slot, dart holes in the wall, the stone's groove) with the guards' bones lying in it; a fired trap
// shows its reload as a gauge on its plate (src/sealed-pyramid-hands.js). THE COUNTERWEIGHTS (the machine): stone blocks on chains in pairs - ride one down
// and the other comes up; a block's weight on one sends the other up.
// SEVEN USES (A4: taught, tested, remixed, examined - ARCS below):
//   LURE A GUARD     tread the plate as the guard walks under the block (THE GALLERY OF PLATES, teach)
//   SPEND IT         fire the darts from the plate, then cross the reach while they reload - or jump the pale stones in it (the gallery's dart run, test)
//   LURE A SQUAD     a groove full of the dead: tread, and the stone takes them all (the lower gallery; THE FALSE TOMB)
//   OPEN THE WAY     THE GREAT STONE breaks THE FALSE TOMB's sealed door - the only way down (set piece two, REQUIRED)
//   WEIGH IT         stand on the pale counterweight: the tomb's own block falls on its mate and its weight takes you up (set piece one, REQUIRED)
//   FILL THE PIT     a block dropped into a scarab pit too wide to jump is the bridge over it (THE SCARAB PITS, REQUIRED)
//   RIDE UNDER IT    spend the dart wall across the last shaft, then ride its counterweight down while it reloads (THE DEEP WAY, the exam)
//
// THE THEMED KEY: four SCARAB SEALS (L.quest). With all four THE SEALED TOMB's door (by the deep way's drop) opens: a silver (no relic, A11).
//
// SEVEN SECTIONS (columns; floors are the solid surface rows - a hero stands on the row above):
//   0-75     THE FACE              the pyramid's steps in the sandstorm (src/desert-rules.js's clock: a gust shoves you back down; hold block to brace),
//                                  up to THE ROBBERS' HOLE (68-70) at the summit (floor 14)
//   64-171   THE GALLERY OF PLATES TEACH  the block over the first guard (plate 76); the dart run (plate 103, the pale stones in it, the hole at 118);
//                                  the lower gallery's groove: lure the squad under the stone (plate 122)
//   172-249  THE COUNTERWEIGHT SHAFTS SET PIECE ONE  ride the first block down (ten rows); WEIGH THE SECOND: its pale mate is a plate and the tomb's block falls
//                                  on the other - up to the high corridor (REQUIRED)
//   250-333  THE FALSE TOMB        SET PIECE TWO  the robbers' walk over the false king's hall; THE GREAT STONE (plate 256) runs the hall's floor and breaks the
//                                  sealed door at 326 - the only way down (REQUIRED); a pale stone at 314 in its road
//   328-411  THE SCARAB PITS       REMIX  fill the first pit (taught, optional), fill the second (too wide to jump: REQUIRED), the darts' corridor where the
//                                  guard treads the plates
//   393-451  THE DEEP WAY          EXAM  THE TOMB-WARDEN (elite mummy) under a block with a scarab pit at his back; THE LAST SHAFT: spend its dart wall, then
//                                  ride under it; THE SEALED TOMB (the vault)
//   452-491  THE ANTECHAMBER       THE SCARAB MOTHER'S LAIR (src/scarab-mother.js stageScarabMother) - the tomb's own block, dart wall and rolling stone. MID-LEVEL
//                                  since claude/pyramidlevel (MINI_SLOT); THE LEVEL'S MINI since claude/pyramidboss (L.mini: her east door its portcullis)
// THE SECOND HALF (claude/pyramidlevel, 2026-10-13, Daniel "way too short"; src/sealed-pyramid-tombs.js): the way UP from her lair to the burial chamber -
//   493-610  THE HALL OF THE DEAD, 611-735 THE EMBALMERS' GALLERY (gas), 736-862 THE OIL CHANNELS (fire), 863-962 THE FLOODED CRYPT (the sluices),
//   963-1006 THE KING'S STAIR (A14 platforming), 1007-1047 THE BURIAL CHAMBER (BOSS_SLOT: THE COFFIN KING, src/tomb-king.js - claude/pyramidboss), the gate at 1049.
//   The same rule: the gas jets, the oil channels and the sluices are TRAPS fired from PLATES; the tombs release the dead (mummies tread plates, the tomb guard does not).
import { stageScarabMother, SM_STAGE } from './scarab-mother.js';
import { buildTombHalf, TH, ARCS2, SECTIONS2, SPOTS2, MINI_SLOT, BOSS_SLOT } from './sealed-pyramid-tombs.js';
export { MINI_SLOT, BOSS_SLOT } from './sealed-pyramid-tombs.js';   /* (claude/pyramidlevel) THE ARENA SLOTS for lane B: the Scarab Mother's lair mid-level, the burial chamber at the end */

/* THE ROWS (a floor is the solid surface row; a hero stands on the row above). H 60: the descent is a walk with drops, not a tower (tools/level-quality.mjs: H > 60 is a tall level) */
export const SP = { W: TH.W, H: 60, start: 28, summit: 14, g1: 22, g2: 30, hall: 40, corr: 30, walk: 30, tomb: 37, pits: 44, deep: 51, arena: 57 };
export const SECTIONS = [['THE FACE', 0], ['THE GALLERY OF PLATES', 64], ['THE COUNTERWEIGHT SHAFTS', 172], ['THE FALSE TOMB', 250], ['THE SCARAB PITS', 328], ['THE DEEP WAY', 406], ['THE ANTECHAMBER', 452], ...SECTIONS2];
export const RULE = 'THE TOMB IS A MACHINE: TREAD A PALE PLATE AND ITS TRAP FIRES ON WHATEVER STANDS IN ITS REACH - LET THE GUARDS STAND THERE, NOT YOU.';
/* each use's arc (tile columns) - read by tools/sealed-pyramid.mjs */
export const ARCS = {
  lure: { teach: [76, 85], test: [121, 164], remix: [250, 327], exam: [408, 418], boss: [452, 491] },   /* the first guard; the lower gallery's squad; THE FALSE TOMB's squad; THE TOMB-WARDEN; her charge into a reach */
  spend: { teach: [103, 121], remix: [383, 405], exam: [436, 443] },                                     /* the dart run; the corridor the guard treads; THE LAST SHAFT (ride under it) */
  weigh: { teach: [172, 185], exam: [206, 215] },                                                        /* ride the first block down; WEIGH THE SECOND (required) */
  open: { remix: [250, 333] },                                                                           /* THE GREAT STONE breaks the false door (required) */
  fill: { teach: [340, 347], test: [353, 365] },                                                         /* the first pit (optional); the second (required) */
  ...ARCS2,   /* (claude/pyramidlevel) THE SECOND HALF: the tombs (rise), the gas, the oil (burn), the sluices (flood), THE KING'S STAIR (climb) - src/sealed-pyramid-tombs.js */
};
const { g1: G1, g2: G2, hall: HL, corr: CO, walk: WK, tomb: TB, pits: PT, deep: DP, arena: AR } = SP;

/* THE TRAPS. id, kind, plates [[x0, x1, row]] (the plate is the floor row's cells - a mover plate is { mover: id }), zone [x0, x1, y0, y1] (its reach,
   inclusive tiles), reset s, and per kind:
     block  slot [x0, x1, y0, y1] (its home in the ceiling), land: the row its bottom comes to rest on the floor (or on: a counterweight it falls onto),
            fill: true - it stays where it lands as footing (a pit) until a respawn
     darts  wall: the column the darts fly from, dir: the way they fly, rows [r0, r1] (the rows they fly in)
     stone  home: its niche's first column, end: the column it shatters at, row: the floor row it rolls on, drop: rows it falls out of a ceiling slot first,
            breaks: a false wall it smashes (L.falseWalls id), 2 rows tall
   inner: plates INSIDE the reach (tread one there and it fires on you), section: 'teach'|'test'|'exam' (the share of a hero it takes) */
const TRAPS = [
  { id: 'g1block', kind: 'block', plates: [[76, 77, G1]], zone: [80, 85, G1 - 6, G1 - 1], slot: [80, 85, G1 - 8, G1 - 7], land: G1 - 1, reset: 3.0, section: 'teach' },
  { id: 'g1darts', kind: 'darts', plates: [[103, 104, G1]], inner: [[111, 112, G1], [115, 116, G1]], zone: [106, 121, G1 - 2, G1 - 1], wall: 122, dir: -1, rows: [G1 - 2, G1 - 1], reset: 3.6, section: 'teach' },
  { id: 'g2stone', kind: 'stone', plates: [[121, 122, G2]], inner: [[140, 141, G2], [152, 153, G2]], zone: [125, 164, G2 - 2, G2 - 1], home: 125, end: 164, row: G2, drop: [G2 - 8, G2 - 7], reset: 5.0, section: 'test' },
  { id: 'weigh', kind: 'block', plates: [{ mover: 'cw2b' }], zone: [206, 207, HL - 24, G2 - 1], slot: [206, 207, HL - 24, HL - 23], on: 'cw2a', reset: 7.0, section: 'test' },
  { id: 'great', kind: 'stone', plates: [[256, 257, WK]], inner: [[314, 315, TB]], zone: [252, 325, TB - 2, TB - 1], home: 250, end: 325, row: TB, breaks: 'falsedoor', reset: 6.0, great: true, section: 'test' },
  { id: 'pit1', kind: 'block', plates: [[340, 341, PT]], zone: [344, 347, PT - 8, PT + 1], slot: [344, 347, PT - 10, PT - 9], land: PT + 1, fill: true, reset: 3.0, section: 'test' },
  { id: 'pit2', kind: 'block', plates: [[353, 354, PT]], zone: [360, 363, PT - 8, PT + 1], slot: [360, 363, PT - 10, PT - 9], land: PT + 1, fill: true, reset: 3.0, section: 'test' },
  { id: 'corr', kind: 'darts', plates: [[383, 384, PT]], inner: [[391, 392, PT], [397, 398, PT]], zone: [386, 405, PT - 2, PT - 1], wall: 406, dir: -1, rows: [PT - 2, PT - 1], reset: 3.4, section: 'test' },
  { id: 'warden', kind: 'block', plates: [[408, 409, DP]], zone: [412, 418, DP - 5, DP - 1], slot: [412, 418, DP - 7, DP - 6], land: DP - 1, reset: 4.0, section: 'exam' },
  { id: 'shaft', kind: 'darts', plates: [[436, 437, DP], { mover: 'cw3a', ride: true }], zone: [440, 443, AR - 3, AR - 2], wall: 439, dir: 1, rows: [AR - 3, AR - 2], reset: 4.6, section: 'exam' },
];
/* THE COUNTERWEIGHTS: pairs of stone blocks on one chain over a wheel. a / b: [x (first column), home row (its top), the other stop's row]. Stood on, a block
   sinks and its mate rises; a TRAP BLOCK fallen on one is heavier than a hero; left alone, a pair goes back to its homes at half the pace. plate: the block whose
   top is a pale plate (a trap's mover plate). The last pair's mate runs in a shaft under the wall, out of reach (it rises only to AR - 4) */
const PAIRS = [
  { id: 'cw1', a: [180, G2, HL], b: [184, HL, G2], wheel: [182, HL - 23], teach: true, ride: 'a' },
  { id: 'cw2', a: [206, G2, HL], b: [214, HL, CO], wheel: [210, HL - 22], plate: 'b', ride: 'b' },
  { id: 'cw3', a: [440, DP, AR], b: [442, AR, AR - 4], wheel: [441, DP - 4], plate: 'a', ride: 'a' },
];
export const FALSE_WALLS = [{ id: 'falsedoor', x0: 326, x1: 327, y0: TB - 6, y1: TB - 1 }];
/* WHERE A PLAYER'S HANDS GO (the walker's hints, src/sealed-pyramid-hands.js walkHint; src/stuck-spots.js names the same tiles): [column, the row he stands on] */
export const SPOTS = { hole: [69, SP.summit - 1], cw1: [180, G2 - 1], weigh: [214, HL - 1], great: [256, WK - 1], pit2: [353, PT - 1], shaftPlate: [436, DP - 1], shaftRide: [440, DP - 1] };

export function buildSealedPyramid({ painter, T, TS }) {
  const { W, H } = SP;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ face: -1, squad }, o || {}));
  /* THE CAST (A9: one new foe - the mummy - and proven machines under the tomb's skins; fewer, weightier) */
  const mummy = (x, y, squad, o) => foe('mummy', x, y, squad, o);                                                                     /* THE MUMMY: the one new AI (src/mummy.js) */
  const guard = (x, y, x0, x1, squad, o) => mummy(x, y, squad, Object.assign({ guard: [x0, x1], inTrap: true }, o || {}));          /* a guard walks its beat INSIDE a trap's reach */
  const blower = (x, y, squad, o) => foe('archer', x, y, squad, Object.assign({ cnSkin: 'dartblower' }, o || {}));                  /* THE TOMB DART-BLOWER: the archer's machine (the ranged one) */
  const jackal = (x, y, squad, o) => foe('hound', x, y, squad, Object.assign({ cnSkin: 'jackal' }, o || {}));                        /* THE TOMB JACKAL: the war hound's machine (the runner) */
  const scarab = (x, y, squad, o) => foe('skitter', x, y, squad, Object.assign({ cnSkin: 'scarab' }, o || {}));                      /* THE SCARABS: the glass sea's crack swarm under a beetle's shell (the pits' swarm) */
  const seal = (x, y) => ent('stray', x, y, { kind: 'scarabseal' });
  const decor = [], interiors = [], structures = [], plats = [], lamps = [], quicksand = [];
  /* A LEDGE: one-way stone on carved corbels (L.plats for the art lane; L.structures says what holds it up - tools/solid-islands.mjs) */
  const groundBelow = (x, y) => { let b = y + 1; while (b < H - 1 && L.grid[b * W + x] === T.AIR) b++; return b; };
  const ledge = (kind, x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); plats.push({ kind, x0, x1, y }); structures.push({ kind: 'py' + kind[0].toUpperCase() + kind.slice(1), x0, x1, top: y, floor: Math.max(groundBelow(x0, y), groundBelow(x1, y)) }); };
  const lamp = (x, y, kind) => lamps.push({ x, y, kind: kind || 'brazier' });

  /* THE PYRAMID IS ONE MASS: solid to the map's edges, the sky and the galleries carved out of it */
  block(0, W - 1, 0, H - 1);

  // ================= 0. THE FACE (0-75): the steps in the sandstorm, up to the robbers' hole =================
  const STEPS = [[0, 9, 28], [10, 15, 26], [16, 21, 24], [22, 27, 22], [28, 33, 20], [34, 39, 18], [40, 45, 16], [46, 75, 14],
    [76, 81, 10], [82, 87, 6], [88, 93, 2]];   /* (past the summit the courses are a man's height each: the face goes on up into the storm, unclimbable) */
  for (const [x0, x1, top] of STEPS) air(x0, x1, 0, top - 1);
  sign(3, 27, 'THE SEALED PYRAMID. THE TOMB IS A MACHINE.');
  decor.push({ kind: 'storm', x0: 0, x1: 75 });
  for (const [x0, x1, top] of [[24, 26, 22], [42, 44, 16]]) { air(x0, x1, top, top); quicksand.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: top * TS }); }   /* drifts on two steps: the storm piles the sand against the courses */
  sign(12, 25, 'THE STORM SHOVES YOU DOWN THE STEPS. HOLD BLOCK TO BRACE.');
  ledge('cornice', 3, 7, 25); ledge('cornice', 14, 18, 21); ledge('cornice', 27, 31, 17); ledge('cornice', 38, 42, 13);   /* broken courses: a cornice a man's reach over the steps (a second height up the face) */
  jackal(30, 19, 'faceJackal1'); jackal(36, 17, 'faceJackal2');
  foe('vulture', 50, 8, 'faceVulture');
  ledge('cornice', 56, 60, 11); seal(58, 10);                                                            /* SEAL ONE, on a broken cornice of the summit (a climb off the route) */
  decor.push({ kind: 'capstone', x0: 62, x1: 66, y: 13 }, { kind: 'scarabrelief', x0: 71, x1: 75, y: 13 });   /* (B8) the first of HER: a scarab carved by the robbers' hole */
  air(68, 70, 14, 15);                                                                                   /* THE ROBBERS' HOLE: down into the first gallery */
  sign(65, 13, 'THE ROBBERS\' HOLE. DOWN IS THE ONLY WAY IN.');

  // ================= 1. THE GALLERY OF PLATES (64-171): TEACH - the block over the first guard; the dart run; the lower gallery's groove and its squad =================
  air(64, 121, G1 - 6, G1 - 1); interiors.push([64, 121, G1 - 6, G1 - 1, 'pyGallery']);
  lamp(66, G1 - 5);
  sign(71, G1 - 1, 'PALE STONES ARE PLATES. TREAD ONE AND ITS TRAP FIRES.');
  ledge('shelf', 64, 67, G1 - 3);                                                                        /* (a jar shelf on the west wall) */
  /* THE FIRST TRAP (LURE A GUARD, safe): the block in its ceiling slot, the plate four steps short of it, the guard on his beat under it */
  air(80, 85, G1 - 8, G1 - 7);
  ent('tplate', 76, G1 - 1, { trap: 'g1block' }); ent('tblock', 80, G1 - 7, { trap: 'g1block' });
  sign(74, G1 - 1, 'TREAD THE PLATE AS THE GUARD WALKS UNDER THE BLOCK.');
  guard(83, G1 - 1, 80, 85, 'g1guard');
  decor.push({ kind: 'bones', x0: 81, x1: 84, y: G1 - 1 });
  ledge('shelf', 89, 93, G1 - 3); decor.push({ kind: 'jars', x0: 89, x1: 93, y: G1 - 4 }); ledge('shelf', 96, 100, G1 - 3);
  /* THE DART RUN (SPEND IT): the gallery's east wall is a dart wall; its plate before the run, two pale stones in it, and the way on is the hole at its end */
  ent('tplate', 103, G1 - 1, { trap: 'g1darts' }); ent('dartwall', 122, G1 - 1, { trap: 'g1darts' });
  sign(99, G1 - 1, 'THE DARTS FIRE FROM THE PLATE. THEN CROSS WHILE THEY RELOAD - OR JUMP THE PALE STONES.');
  ledge('shelf', 107, 114, G1 - 3);                                                                      /* a shelf over the darts' rows: a hero on it is over them */
  guard(112, G1 - 1, 106, 121, 'g1darts'); jackal(117, G1 - 1, 'g1darts');
  decor.push({ kind: 'bones', x0: 108, x1: 110, y: G1 - 1 }, { kind: 'dartholes', x: 122, y0: G1 - 2, y1: G1 - 1 });
  air(118, 120, G1, G1 + 1);                                                                             /* the hole down to the lower gallery, at the run's end */
  /* THE LOWER GALLERY (G2): a dead end west (a seal on its shelf), and THE GROOVE east - the stone drops from its slot and rolls the gallery's length */
  air(100, 171, G2 - 6, G2 - 1); interiors.push([100, 171, G2 - 6, G2 - 1, 'pyGallery']);
  ledge('shelf', 100, 104, G2 - 3); seal(102, G2 - 4);                                                   /* SEAL TWO, the west pocket's shelf (a branch off the route) */
  lamp(110, G2 - 5); ledge('shelf', 109, 115, G2 - 3);
  air(125, 126, G2 - 8, G2 - 7);                                                                         /* the stone's slot in the ceiling */
  ent('tplate', 121, G2 - 1, { trap: 'g2stone' }); ent('rollstone', 125, G2 - 1, { trap: 'g2stone' });
  sign(123, G2 - 1, 'A GROOVE FULL OF THE DEAD: TREAD THE PLATE AND THE STONE RUNS IT.');
  ledge('shelf', 132, 135, G2 - 3); ledge('shelf', 146, 149, G2 - 3); ledge('shelf', 158, 161, G2 - 3);  /* refuges over the groove: the stone runs under them */
  mummy(137, G2 - 1, 'g2squad', { face: -1 }); mummy(149, G2 - 1, 'g2squad'); jackal(157, G2 - 1, 'g2squad');
  decor.push({ kind: 'groove', x0: 125, x1: 166, y: G2 - 1 }, { kind: 'bones', x0: 143, x1: 145, y: G2 - 1 });
  air(165, 166, G2, G2 + 1);                                                                             /* the slot the stone ends in (two rows: step in and out) */

  // ================= 2. THE COUNTERWEIGHT SHAFTS (172-249): SET PIECE ONE - ride the first block down; WEIGH THE SECOND to go up =================
  air(167, 171, G2 - 6, G2 - 1);
  air(172, 215, HL - 24, HL - 1); interiors.push([172, 215, HL - 24, HL - 1, 'pyShafts']);
  block(172, 179, G2, HL - 1);                                                                           /* the landing (the lower gallery's floor runs on into the hall) */
  ent('check', 170, G2 - 1);                                                                             /* CHECKPOINT ONE, on the landing over the shafts */
  sign(176, G2 - 1, 'STONE BLOCKS ON ONE CHAIN: RIDE ONE DOWN, AND THE OTHER COMES UP.');
  for (const p of PAIRS) for (const [x, top, other] of [p.a, p.b]) air(x, x + 1, Math.min(top, other), Math.max(top, other) + 1);   /* the shafts the blocks run in */
  decor.push({ kind: 'cwheel', x: 182, y: HL - 23 }, { kind: 'cwheel', x: 210, y: HL - 22 });
  lamp(174, G2 - 5); lamp(198, HL - 12);
  ledge('shelf', 188, 191, HL - 3); ledge('shelf', 194, 198, HL - 6); blower(196, HL - 7, 'hallBlower'); ledge('shelf', 200, 204, HL - 3);
  mummy(200, HL - 1, 'hallFloor'); jackal(205, HL - 1, 'hallFloor');
  /* WEIGH IT: the second pair - its west block hangs high under the tomb's block; its east block, at your feet, is a PALE PLATE. Tread it: the block falls on its
     mate, the weight takes the mate down, and you go up to the high corridor (the only way on) */
  ent('tblock', 206, HL - 23, { trap: 'weigh' });
  ent('tplate', 214, HL - 1, { trap: 'weigh', mover: 'cw2b' });
  sign(211, HL - 1, 'THE PALE BLOCK IS A PLATE. TREAD IT: THE TOMB\'S BLOCK FALLS ON ITS MATE, AND YOU GO UP.');
  /* THE HIGH CORRIDOR (216-249) */
  air(216, 249, CO - 6, CO - 1); interiors.push([216, 249, CO - 6, CO - 1, 'pyCorridor']);
  decor.push({ kind: 'mural', x0: 226, x1: 238, y: CO - 5 });                                            /* (B8) THE MURAL: a queen of scarabs, the tomb's guards feeding her brood */
  lamp(222, CO - 5); lamp(244, CO - 5); ledge('shelf', 218, 223, CO - 3); ledge('shelf', 229, 235, CO - 3); ledge('shelf', 241, 246, CO - 3);
  jackal(240, CO - 1, 'corrJackal');

  // ================= 3. THE FALSE TOMB (250-333): SET PIECE TWO - the robbers' walk over the false king's hall; THE GREAT STONE breaks the sealed door =================
  air(250, 325, TB - 19, TB - 1); interiors.push([250, 325, TB - 19, TB - 1, 'pyFalseTomb']);
  for (let x = 250; x <= 305; x++) set(x, WK, T.ONEWAY); plats.push({ kind: 'walk', x0: 250, x1: 305, y: WK });
  structures.push({ kind: 'pyWalk', x0: 250, x1: 305, top: WK, floor: TB });
  ent('check', 252, WK - 1);                                                                             /* CHECKPOINT TWO, on the robbers' walk */
  ent('tplate', 256, WK - 1, { trap: 'great' }); ent('rollstone', 250, TB - 1, { trap: 'great', great: true });
  sign(259, WK - 1, 'THE GREAT STONE: TREAD ITS PLATE AND IT RUNS THE HALL\'S FLOOR - AND BREAKS WHAT IT MEETS.');
  decor.push({ kind: 'falsedoor', x0: 326, x1: 327, y0: TB - 6, y1: TB - 1 }, { kind: 'groove', x0: 250, x1: 325, y: TB - 1 });
  decor.push({ kind: 'sarcophagus', x: 274, y: TB - 1 }, { kind: 'sarcophagus', x: 288, y: TB - 1 }, { kind: 'sarcophagus', x: 312, y: TB - 1 }, { kind: 'falseking', x: 281, y: TB - 14 });
  mummy(274, TB - 1, 'tombSquad', { face: -1 }); mummy(288, TB - 1, 'tombSquad'); mummy(312, TB - 1, 'tombSquad'); scarab(296, TB - 1, 'tombBrood');   /* (and a swarm out of the false king's own tomb) */
  jackal(282, WK - 1, 'tombWalk');
  ledge('shelf', 268, 271, WK - 3); ent('silver', 269, WK - 4);                                         /* A SILVER on the high shelf over the walk (off the route) */
  ledge('shelf', 290, 293, WK - 3); blower(291, WK - 4, 'tombBlower');
  ledge('shelf', 298, 301, TB - 3); ledge('shelf', 303, 306, TB - 5); seal(299, TB - 4);                /* SEAL THREE, on the stair from the hall's floor back up to the walk */
  sign(305, WK - 1, 'THE FLOOR IS THE STONE\'S ROAD. A PALE STONE ON IT FIRES IT.');
  lamp(262, TB - 16); lamp(318, TB - 16);
  block(326, 327, TB - 6, TB - 1);                                                                       /* THE FALSE DOOR: sealed; the great stone breaks it */
  air(328, 333, TB - 6, PT - 1);                                                                         /* the robbers' shaft behind it, down to the pits */

  // ================= 4. THE SCARAB PITS (328-405): REMIX - fill the pits; the corridor where the guard treads the plates =================
  air(334, 405, PT - 8, PT - 1); interiors.push([328, 405, PT - 8, PT - 1, 'pyPits']);
  ent('check', 337, PT - 1);                                                                             /* CHECKPOINT THREE, at the foot of the robbers' shaft */
  const pit = (x0, x1) => { air(x0, x1, PT, PT + 1); for (let x = x0; x <= x1; x++) set(x, PT + 2, T.SPIKE); decor.push({ kind: 'scarabpit', x0, x1, y: PT + 2 }); };
  /* THE FIRST PIT (taught, a jump will do): its block over it, the plate before it */
  pit(344, 347); air(344, 347, PT - 10, PT - 9); ent('tplate', 340, PT - 1, { trap: 'pit1' }); ent('tblock', 344, PT - 9, { trap: 'pit1' });
  sign(338, PT - 1, 'THE SCARAB PITS. A BLOCK DROPPED IN A PIT IS A STONE TO STAND ON.');
  scarab(349, PT - 1, 'pit1Brood');
  /* THE SECOND PIT (REQUIRED): eight wide - no jump crosses it; its block fills the middle */
  pit(358, 365); air(360, 363, PT - 10, PT - 9); ent('tplate', 353, PT - 1, { trap: 'pit2' }); ent('tblock', 360, PT - 9, { trap: 'pit2' });
  sign(351, PT - 1, 'TOO WIDE TO JUMP: TREAD THE PLATE, AND THE BLOCK FILLS THE PIT.');
  scarab(356, PT - 1, 'pit2Brood'); scarab(367, PT - 1, 'pit2Brood');
  ledge('shelf', 369, 372, PT - 3); blower(370, PT - 4, 'pitsBlower'); ledge('shelf', 334, 338, PT - 3); ledge('shelf', 374, 379, PT - 3);
  jackal(376, PT - 1, 'pitsJackals'); jackal(380, PT - 1, 'pitsJackals');
  /* THE DARTS' CORRIDOR: the plate before it, two pale stones in it, the hole down at its end - and its guard treads them as he comes at you */
  ent('tplate', 383, PT - 1, { trap: 'corr' }); ent('dartwall', 406, PT - 1, { trap: 'corr' });
  sign(381, PT - 1, 'HE IS HEAVY: WHERE THE GUARD TREADS, THE DARTS FIRE. STAND CLEAR OF THE REACH.');
  guard(394, PT - 1, 388, 404, 'corrGuard'); scarab(389, PT - 1, 'corrBrood');
  ledge('shelf', 386, 388, PT - 3); ledge('shelf', 389, 392, PT - 6); ent('silver', 390, PT - 7);      /* A SILVER high over the corridor (off the route) */
  decor.push({ kind: 'dartholes', x: 406, y0: PT - 2, y1: PT - 1 }, { kind: 'bones', x0: 393, x1: 395, y: PT - 1 }, { kind: 'eggs', x0: 372, x1: 378, y: PT - 1 });   /* (B8) HER EGG-CASES */
  lamp(342, PT - 7); lamp(374, PT - 7);
  air(401, 403, PT, DP - 6);                                                                             /* the hole down to the deep way */

  // ================= 5. THE DEEP WAY (393-451): EXAM - THE TOMB-WARDEN under a block, a scarab pit at his back; THE LAST SHAFT; THE SEALED TOMB =================
  air(393, 439, DP - 5, DP - 1); interiors.push([393, 439, DP - 5, DP - 1, 'pyDeep']);
  /* THE SEALED TOMB (the vault): its door at 397, four seals open it */
  const vaultDoors = [{ id: 'sealed', x: 397, y0: DP - 5, y1: DP - 1, seals: 4 }];
  block(397, 397, DP - 5, DP - 1); ent('sealvault', 397, DP - 1, { id: 'sealed' }); ent('silver', 394, DP - 1);
  sign(399, DP - 1, 'THE SEALED TOMB. FOUR SCARAB SEALS OPEN ITS DOOR.');
  /* THE TOMB-WARDEN (ELITE): under the block, the plate before him, a scarab pit at his back (a heavy blow throws a foe into it - src/knock-into.js) */
  air(412, 418, DP - 7, DP - 6); ent('tplate', 408, DP - 1, { trap: 'warden' }); ent('tblock', 412, DP - 6, { trap: 'warden' });
  sign(405, DP - 1, 'THE TOMB-WARDEN. HIS BLOCK IS OVER HIM - BUT HE TAKES ONLY A SHARE OF IT.');
  guard(415, DP - 1, 412, 418, 'wardenExam', { elite: true, gate: 426 });
  air(420, 422, DP, DP + 1); for (let x = 420; x <= 422; x++) set(x, DP + 2, T.SPIKE); decor.push({ kind: 'scarabpit', x0: 420, x1: 422, y: DP + 2 });
  ledge('shelf', 428, 431, DP - 3); blower(430, DP - 4, 'deepBlower'); seal(429, DP - 4); ledge('shelf', 423, 425, DP - 3);              /* SEAL FOUR, by the blower's shelf */
  lamp(410, DP - 4); lamp(434, DP - 4); lamp(453, AR - 8); lamp(490, AR - 8); lamp(471, AR - 12);   /* (and the antechamber's three braziers) */
  /* THE LAST SHAFT (RIDE UNDER IT): the landing's plate fires the dart wall across the shaft; the counterweight's own top is its second plate - ride it down
     unspent and the darts fly as you pass them */
  air(440, 441, DP - 5, DP - 1);   /* (over the block: the deep way ends at its shaft; its mate runs in a shaft under the wall, out of reach) */
  ent('tplate', 436, DP - 1, { trap: 'shaft' }); ent('dartwall', 439, AR - 2, { trap: 'shaft' }); ent('tplate', 440, DP - 1, { trap: 'shaft', mover: 'cw3a' });
  sign(434, DP - 1, 'SPEND THE DART WALL FROM THE PLATE. THEN RIDE THE BLOCK DOWN UNDER IT.');
  decor.push({ kind: 'dartholes', x: 439, y0: AR - 3, y1: AR - 2 }, { kind: 'cwheel', x: 441, y: DP - 4 });
  air(442, 451, AR - 4, AR - 1); interiors.push([442, 451, AR - 4, AR - 1, 'pyDeep']);
  ent('check', 448, AR - 1);                                                                             /* CHECKPOINT FOUR, before her (A10b) */
  decor.push({ kind: 'scarabrelief', x0: 446, x1: 451, y: AR - 3 });

  // ================= THE SCARAB MOTHER's ANTECHAMBER (src/scarab-mother.js), at the foot of the tomb =================
  const AX = 452;
  const stage = stageScarabMother({ set, block, ent, air }, T, TS, AX, AR);
  stage.carve(); interiors.push([AX, AX + SM_STAGE.W - 1, AR - SM_STAGE.roof, AR - 1, 'pyAntechamber']);
  for (const l of SM_STAGE.ledges) structures.push({ kind: 'pyLedge', x0: AX + l.x0, x1: AX + l.x1, top: AR - l.dy, floor: AR });
  /* (claude/pyramidlevel) her lair is MID-LEVEL now: the level's gate is at the far end (src/sealed-pyramid-tombs.js), her east door opens on THE HALL OF THE DEAD */
  decor.push({ kind: 'dartholes', x: AX + SM_STAGE.W - 1, y0: AR - 2, y1: AR - 1 }, { kind: 'bones', x0: AX + 10, x1: AX + 13, y: AR - 1 }, { kind: 'bones', x0: AX + 30, x1: AX + 33, y: AR - 1 }, { kind: 'groove', x0: AX + 1, x1: AX + 38, y: AR - 1 }, { kind: 'eggs', x0: AX + 2, x1: AX + 6, y: AR - 1 });   /* (the antechamber's reaches scored, her eggs by her niche) */

  // ================= THE SECOND HALF (claude/pyramidlevel): the way up from her lair - the tombs, the gas, the oil, the flooded crypt, THE KING'S STAIR, the burial chamber =================
  const half = buildTombHalf({ set, block, ent, air, T, TS, sign, mummy, guard, blower, jackal, scarab, foe, ledge, lamp, decor, interiors, structures, plats });

  /* THE TRAPS, THE PAIRS AND THE FALSE DOOR as the hands want them (px where it moves) */
  const traps = TRAPS.map(t => JSON.parse(JSON.stringify(t))).concat(stage.traps, half.traps);
  const moversExtra = [];
  for (const p of PAIRS) for (const [role, [x, home, other]] of [['a', p.a], ['b', p.b]]) moversExtra.push({ kind: 'lift', pyr: p.id + role, pair: p.id, role, x: x * TS, y: home * TS, y0: home * TS, y1: other * TS, home: home * TS, top: Math.min(home, other) * TS, bot: Math.max(home, other) * TS, w: 32, h: 8, speed: 46, plate: p.plate === role, wheel: p.wheel, hidden: p.id === 'cw3' && role === 'b', ride: p.ride === role });
  /* THE REACH MODEL (src/reachcore.js, L.sealedpyramid): a pit a block fills counts as filled, the false door as broken (the great stone is on the road before it) */
  const pitFill = traps.filter(t => t.fill).map(t => [t.zone[0], t.zone[1], t.land - 1, t.land]);
  const masonry = [[0, W - 1, 0, H - 1]];
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: SP.start - 1 }, pools: half.pools, gasVents: half.gasVents, crumble: half.crumble, tombs: half.tombs, slots: { mini: MINI_SLOT, boss: BOSS_SLOT }, falls: [], moversExtra, interiors, structures,
    mini: stage.mini, arena: half.arena, gateAfterBoss: true, reachDoors: [{ x0: MINI_SLOT.eastDoor.col, x1: MINI_SLOT.eastDoor.col, y0: MINI_SLOT.eastDoor.y0, y1: MINI_SLOT.eastDoor.y1 }],   /* (claude/pyramidboss) her portcullis: the reach model reads it open (her death lifts it) */   /* (claude/pyramidboss, LANE B) THE SCARAB MOTHER is the level's MINI in her lair mid-level (MINI_SLOT: her east door is its portcullis); THE COFFIN KING is its boss in the burial chamber (BOSS_SLOT, src/tomb-king.js) - lane A's temporary arena.until and L.routePastBoss are gone */
    sealedpyramid: true, caravan: true,   /* caravan: the desert's hands in main.js (the desert machines' runner: the mummy, the scarabs; the sand skins) */
    traps, pairs: PAIRS.map(p => ({ ...p })), falseWalls: FALSE_WALLS.map(w => ({ ...w })), pitFill, vaultDoors, decor, plats, lamps, quicksand, spots: JSON.parse(JSON.stringify({ ...SPOTS, ...SPOTS2 })),
    rigBands: moversExtra.filter(m => m.ride).map(m => [Math.floor(m.x / TS), Math.floor(m.x / TS) + 1, Math.floor(m.top / TS) - 1, Math.floor(m.bot / TS) - 1]),   /* (each counterweight a hero RIDES is a ride between its stops: the first and last pairs' blocks that go down under you, the second's pale block that a trap's weight sends up - not their mates, which only move against a load) */
    /* THE TOMB HITS HARD (difficulty v2: weight, not numbers): a blow x this on top of the act's tier, by skin (main.js damagePlayer0 reads L.foeHit) */
    knockHazards: [],   /* (the scarab pits are spike tiles the shared helper reads already: the warden's pit, the pits' lips) */
    foeHit: { dartblower: 1.1, jackal: 2.3, scarab: 1.6, venomscorpion: 1.7, firescorpion: 1.7, sanddrowned: 2.8 }, foeHp: { dartblower: 2.2, jackal: 2.6, scarab: 1.6, venomscorpion: 2.4, firescorpion: 2.4, sanddrowned: 3.2 },   /* (claude/pyramidlevel: the reused desert foes at the Buried City's weights; the tomb guard is the mummy's machine at its own SKEL numbers) */
    alarms: traps.map(t => ({ x0: t.zone[0] - 4, x1: t.zone[1] + 4 })),   /* THE RULE'S STATE for tools/rule-state.mjs: the reaches are where the rule is live */
    sandstorm: { x0: 0, x1: 76 * TS, dirs: [-1, -1, -1] },   /* THE FACE's storm (src/sealed-pyramid-hands.js on src/desert-rules.js's clock) */
    quest: { n: 4, item: 'scarabseal', name: 'SEALS', done: 'FOUR SEALS: THE SEALED TOMB OPENS', thanks: 'THE SEALED TOMB OPENS' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    squadBands: [{ lo: 1000, hi: 1199, spots: 0, why: 'THE BURIAL CHAMBER: columns 1000-1199 are the Coffin King arena (a shrine at 1003 before it) - no squad stands in a boss arena, as the canal and the theatre' }],
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 220,   /* (A10b: a shrine a section - 170, 252, 337, 448 | her lair | 615, 737, 858, 1003 before the burial chamber) */
    unlocks: [
      { kind: 'tplate', opens: 'a TRAP: a falling block (a guard crushed, a pit filled, a counterweight weighed down), a dart wall, a rolling stone (a squad run down, the false door broken); the embalmers gas jets, an oil channel fire, a sluice (the bore, then the water rises: the way up in the cistern and the crypt)', hud: 'THE PLATE CLICKS: THE TRAP FIRES' },
      { kind: 'stray', opens: 'THE SEALED TOMB by the deep way\'s drop once all four scarab seals are carried (a silver)', hud: 'SEALS n/4 - THE SEALED TOMB WAITS (the quest counter)' },
      { kind: 'sealvault', opens: 'THE SEALED TOMB\'s door: four seals open it (a silver)', hud: 'THE SEALED TOMB OPENS' },
    ],
    music: 'sealedpyramid',
    ambient: [{ x0: 0, x1: 99999, kind: 'sealedpyramid' }],   /* its own bed: src/audio.js SYNTH_BEDS.sealedpyramid (the tomb's hush, sand sifting from the courses, far stone grinding) */
    rockZones: [], masonry, masonryKit: 'limestone', ledgeKit: 'desert',   /* the whole tomb is laid stone: coursed ashlar (greybox: the monks' warm limestone kit until the art lane's own) */
    palette: { set: 'desert', near: 'none', dress: 'none', noFg: true, noNear: true, haze: 'rgba(200,160,100,0.05)' },
    noSkyRays: true, duskStart: -1, duskLen: 1,
  };
}
