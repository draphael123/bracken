// src/buried-city.js - THE BURIED CITY, desert act, main road past THE BANDIT KSAR. BURIED CITY 2 (claude/buriedcity2, the OPUS DESIGN PASS, 2026-10-11):
// the full rework of the 10-08 greybox (claude/buriedcity) after Daniel played it live (10-10: "prototype state, not much character ... lackluster level
// design-wise, it doesn't have much going on"); scratch/brief-buriedcity2.md + scratch/review-buriedcity.md. KEPT: the rule (one sentence, an E verb on every
// room, the sand body + roof streams + OPEN/SHUT gauges), THE GREAT SAND-GATE and THE HOURGLASS, the cast (construct, sand-drowned, brass scorpion, sand-folk
// slingers - no goblin past the Goblin Queen), the fix pass's levers. NEW: the city is UNDER A SAND ROOF for real (no sky past the sinkhole; daylight only as
// SHAFTS through holes in the roof, and the desert's sun drain lives in those shafts - the shade rule turned inside out), THE HOURGLASS TOWER in view the whole
// way (src/redraw/buried_city_backdrop.js), two new set pieces that are verbs (THE SINKING STREET, THE SAND-FALL), platform variety (balconies on corbels,
// cloth awnings, brass pipes, hung beams, domes, minaret stubs, buried roofs, sand heaps - L.plats), weight (three elite exams on footing with a hazard by them,
// fights while the sand moves), and an approach that sets up the king (his statues, his murals, his kneeling courtiers, his clock).
// ART IS PLACEHOLDER: the SONNET art lane draws the kit (the exact list is in work/claude/lane-done/claude-buriedcity2.md) - ART BEFORE LIVE.
// Main road: ksar > BURIED CITY > THE SEALED PYRAMID (scratch/brief-sealedpyramid.md: it needs 'buriedcity'; the throne room's far door is its road).
//
// THE RULE: THE CITY'S ROOMS FILL WITH SAND: PULL A SAND-GATE AND A ROOM DRAINS; SHUT IT AND THE SAND RISES - AND CARRIES YOU.
// A SAND ROOM (L.rooms) has a floor-gate and holes in its roof the city's sand pours through. Its SAND-GATE LEVER (E, src/buried-city-hands.js) works the gate:
// OPEN, the room drains (its sand runs out through the floor); SHUT, the pour fills it a row at a time. Sand is footing: it RISES UNDER YOU AND CARRIES YOU UP -
// and whatever stands on it goes down with it when it drains. A SAND-FALL from a crack in the roof can be SWUNG by its CHUTE LEVER (E): the sand piles up
// where it lands. The state is drawn (A3): the sand body, the streams from the roof while it fills, the gate's slot running while it drains, the fall and its
// chute, and a GAUGE on every lever (its level, and OPEN/SHUT - or where the chute points). SEVEN USES:
//   DRAIN TO PASS  a room full to the top of its doorway shuts the way: drain it (THE FIRST SAND ROOM, THE UPPER BULB, THE DROWNED QUARTER's great gate)
//   RIDE IT UP     a room whose way on is high: shut its gate and the sand carries you up (THE GRANARY, THE CLOCK SHAFT - in a shaft of sun)
//   SINK IT        THE SINKING STREET: a whole buried street stands on a pit of sand - open its gate and the street goes down a storey with you on it,
//                  to the arch under it (set piece three, NEW)
//   FILL TO CROSS  a room over stakes or an open drop: shut its gate and walk over on the sand (THE SPIKE CELLAR; THE TRAP HALL in the exam)
//   RUN IT DOWN    THE HOURGLASS: the upper bulb's gate pours its sand INTO the lower bulb (set piece two) - the constructs there come up JAMMED
//   PILE IT UP     THE SAND-FALL: swing the fall onto the wall and its sand heaps into a stair to the high arch; swing it back off the heap to climb it
//                  (set piece four, NEW)
//   FEED IT        THE TRAP HALL (THE EXAM): its floor-gate is open (a drop to the end) and the roof's fall lands on the lip - shut the gate AND swing the fall in
// THE GREAT SAND-GATE (set piece one, REQUIRED): a wheel turned three times drains the whole Drowned Quarter - the old street comes out from under it.
// THE SUN UNDER THE ROOF (A13, the desert's shared drain): only where the roof has fallen in (L.sun) - cross a shaft quick, fight in the shade.
//
// THE THEMED KEY: five brass GEARS (L.quest). With all five THE CLOCKWORK VAULT's door (the cellar by the throne-hall door) opens: a silver (no relic).
//
// SEVEN SECTIONS (columns; the city's street is row 36, the upper street 28, the halls 38/32, the sluice 42, the Drowned Quarter's old street 44, the throne
// street 32):
//   0-47     THE DUNES              the last of the sky: the king's head in the dune, the sinkhole stair down under the sand roof
//   48-111   THE SAND STAIR         TEACH    the first shaft of sun; THE FIRST SAND ROOM (drain it: its lever outside, nothing in reach); the first drowned
//   112-199  THE BURIED BAZAAR      TEST     the market's sun lane and its awnings' shade; THE GRANARY (ride it up under a slinger); THE UPPER STREET: the first
//                                            construct, the king's statue
//   200-236  THE SINKING STREET     SET PIECE (NEW) a buried street on a pit of sand: open its gate and it goes down a storey with you and its watch on it
//   237-336  THE HOURGLASS HALLS    REMIX    THE SPIKE CELLAR (fill to cross); THE HOURGLASS (run it down); the halls' exam: an ELITE in a shaft of sun with
//                                            stakes behind him
//   337-395  THE SAND-FALL          SET PIECE (NEW) the sluice hall: swing the fall onto the wall, let it pile, swing it back, climb to the arch
//   396-512  THE DROWNED QUARTER    SET PIECE THE GREAT SAND-GATE (REQUIRED); the foundry yard (an open floor-gate taught safe) and its ELITE with a drift by him
//   513-629  THE THRONE STREET      EXAM     THE CLOCK SHAFT (ride it up through the sun), THE TRAP HALL (shut its floor-gate AND swing the fall in, under a
//                                            construct the fall holds and a slinger; open, a fall is the end), THE THRONE'S WARDEN (ELITE, gate), the vault
//   630-669  THE THRONE ROOM        BOSS     THE HOURGLASS KING (src/hourglass-king.js stageHourglassKing), at the foot of the Hourglass Tower
import { stageHourglassKing, HK_STAGE } from './hourglass-king.js';

/* THE ROWS BELOW ARE LOGICAL: the city is laid on them and the build sets it ONE ROW LOWER in the grid (DY: one more row of sand roof over everything), so every
   street's feet stand on the top row of a four-row height band (the dunes' 24, the street's 36, the upper street's 28, the halls' corridor 32, the old street's 44)
   and a balcony three rows up is a second height (tools/level-quality.mjs bands). The exported ROOMS, CHUTES, WHEEL and the built level are in GRID rows (+DY) */
export const DY = 1;
export const BC = { W: 672, H: 49, dune: 24, base: 36, upper: 28, hall: 38, corr: 32, sluice: 42, quarter: 36, low: 44, throne: 32 };
export const SECTIONS = [['THE DUNES', 0], ['THE SAND STAIR', 48], ['THE BURIED BAZAAR', 112], ['THE SINKING STREET', 200], ['THE HOURGLASS HALLS', 237], ['THE SAND-FALL', 337], ['THE DROWNED QUARTER', 396], ['THE THRONE STREET', 513], ['THE THRONE ROOM', 630]];
export const RULE = 'THE CITY\'S ROOMS FILL WITH SAND: PULL A SAND-GATE AND A ROOM DRAINS; SHUT IT AND THE SAND RISES - AND CARRIES YOU.';
/* each use's arc (tile columns) - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/buried-city.mjs */
export const ARCS = {
  drain: { teach: [56, 74], test: [274, 292], remix: [396, 467], exam: [513, 526], boss: [630, 669] },   /* the first room; the upper bulb; THE GREAT SAND-GATE (required); the shaft's drop back; the king's glass */
  ride: { teach: [138, 156], remix: [196, 236], test: [513, 526] },                                    /* THE GRANARY; THE SINKING STREET (it rides you DOWN); THE CLOCK SHAFT (through the sun) */
  fill: { teach: [237, 262], remix: [293, 310], exam: [536, 562] },                                    /* THE SPIKE CELLAR; the lower bulb; THE TRAP HALL (required) */
  fall: { teach: [337, 380], exam: [536, 562] },                                                        /* THE SAND-FALL (required: pile it to the arch); THE TRAP HALL (feed it) */
  sun: { teach: [48, 56], test: [112, 138], remix: [311, 324], exam: [513, 526] },                      /* cross a shaft; the market's awnings are shade; the halls' elite in the light; the clock shaft's ride */
};
/* the sand rooms: x0..x1 the interior, floor the surface row under the sand (the sand stands on rows floor-full .. floor-1), full its rows, init its state on a
   fresh load ('full' or 'empty'), levers [x, feet row, chain rows (a CHAIN up the wall: pulled anywhere on its length - the lever inside a room you may be
   standing on the sand of)], need (the route must cross it full: the reach model counts it full), pour (the roof feeds it while its gate is shut), into (its sand
   runs into that room when its gate is open: THE HOURGLASS), trap (its floor-gate is the floor: open, the room is a drop), fedBy (a CHUTE's fall feeds it, not
   the roof: it fills while its gate is shut AND the chute points into it), deck (THE SINKING STREET: a street laid ON the sand - the deck row is solid wall to wall
   and the cells over it are [tile, x0, x1, dy0, dy1] rows relative to it; it rides the sand's top up and down), fill/drain rows a second, use (what it asks) */
const ROOMS_RAW = [
  { id: 'first', x0: 62, x1: 73, floor: 36, full: 5, init: 'full', levers: [[58, 35], [72, 35, 5]], pour: true, fill: 1.0, drain: 2.2, use: 'drain', door: [74, 33, 35] },
  { id: 'granary', x0: 142, x1: 155, floor: 36, full: 8, init: 'empty', levers: [[144, 35]], pour: true, fill: 1.1, drain: 2.4, use: 'ride', door: [156, 25, 27] },
  { id: 'street', x0: 200, x1: 233, floor: 39, full: 10, init: 'full', levers: [[197, 27], [233, 37, 9]], pour: true, fill: 0.9, drain: 1.6, use: 'sink', door: [234, 35, 37],
    deck: [['ONEWAY', 203, 207, -3, -3], ['SOLID', 212, 213, -2, -1], ['ONEWAY', 217, 222, -4, -4], ['SOLID', 227, 230, -1, -1]] },   /* (a house roof, a minaret stub, a house roof, a dome: the street's watch rides it) */
  { id: 'cellar', x0: 246, x1: 259, floor: 44, full: 6, init: 'empty', levers: [[242, 37], [262, 37]], pour: true, fill: 1.3, drain: 2.0, use: 'fill', need: true, spikes: 43 },
  { id: 'upperbulb', x0: 282, x1: 291, floor: 32, full: 5, init: 'full', levers: [[278, 31], [290, 31, 5]], pour: true, fill: 0.9, drain: 1.0, use: 'drain', into: 'lowerbulb', door: [292, 29, 31] },
  { id: 'lowerbulb', x0: 294, x1: 309, floor: 42, full: 10, init: 'empty', levers: [], pour: false, fill: 2.0, drain: 2.0, use: 'fill', need: true },   /* (need: the upper bulb's sand is in it by the time you reach it - the reach model counts it full) */
  { id: 'great', x0: 411, x1: 466, floor: 44, full: 20, init: 'full', levers: [], pour: false, fill: 0, drain: 3.0, use: 'drain', great: true, door: [467, 40, 43] },
  { id: 'yard', x0: 498, x1: 500, floor: 46, full: 2, init: 'empty', levers: [[496, 43]], pour: true, fill: 1.4, drain: 3.0, use: 'fill', trap: true, teach: true, lips: [496, 502] },   /* THE FOUNDRY'S FLOOR-GATE: the trap hall taught safe (a three-row drop onto the foundry's floor: a quarter of you and back to the lip) */
  { id: 'shaft', x0: 514, x1: 525, floor: 44, full: 12, init: 'empty', levers: [[516, 43]], pour: true, fill: 1.2, drain: 2.4, use: 'ride', door: [526, 29, 31] },
  { id: 'trap', x0: 546, x1: 559, floor: 46, full: 14, init: 'empty', levers: [[544, 31], [562, 31]], pour: false, fedBy: 'trapfall', fill: 2.2, drain: 3.0, use: 'fill', need: true, trap: true, lamps: [545, 560] },
];
/* THE SAND-FALLS: a crack in the sand roof at col x pours a FALL (from row roof+1) that a CHUTE swings between two places it lands, [x0, x1] the fall's columns:
   'grate' a floor grille (the sand runs away under it), 'lip' a street (the sand runs off it), 'mound' a HEAP that piles up where it lands ([row above the floor,
   x0, x1] rungs, a row a beat while the fall is on it; the heap stays until a respawn), 'room' a sand room it feeds (fedBy). A hero in the fall is beaten down (he
   cannot rise in it, and walks slow - no blow, no damage), a construct in it is JAMMED. levers: the chute levers (E swings it to the other place) */
const CHUTES_RAW = [
  { id: 'sluice', x: 366, roof: 24, at: 'grate', levers: [[345, 41], [366, 41]],
    to: { grate: { x0: 352, x1: 354, kind: 'grate', floor: 42 }, wall: { x0: 377, x1: 379, kind: 'mound', floor: 42, rate: 2.0,
      rungs: [[1, 368, 379], [2, 368, 379], [3, 371, 379], [4, 371, 379], [5, 374, 379], [6, 374, 379], [7, 377, 379], [8, 377, 379]] } }, other: { grate: 'wall', wall: 'grate' } },
  { id: 'trapfall', x: 548, roof: 20, at: 'lip', levers: [[538, 31]],
    to: { lip: { x0: 540, x1: 542, kind: 'lip', floor: 32 }, hall: { x0: 551, x1: 553, kind: 'room', room: 'trap' } }, other: { lip: 'hall', hall: 'lip' } },
];
/* (in GRID rows: + DY) */
export const ROOMS = ROOMS_RAW.map(r => ({ ...r, floor: r.floor + DY, levers: r.levers.map(([x, row, ch]) => (ch ? [x, row + DY, ch] : [x, row + DY])), door: r.door ? [r.door[0], r.door[1] + DY, r.door[2] + DY] : undefined, spikes: r.spikes ? r.spikes + DY : undefined }));
export const CHUTES = CHUTES_RAW.map(c => ({ ...c, roof: c.roof + DY, levers: c.levers.map(([x, row]) => [x, row + DY]), to: Object.fromEntries(Object.entries(c.to).map(([k, t]) => [k, { ...t, floor: t.floor !== undefined ? t.floor + DY : undefined }])) }));
export const WHEEL = { x: 405, row: 35 + DY, room: 'great', turns: 3 };
/* THE SHAFTS OF SUN: where the sand roof has fallen in (open to the sky, the only daylight in the city) - THE SUN's drain (src/sun-hands.js) lives here and on the dunes */
export const SUN = [{ x0: 0, x1: 37 }, { x0: 52, x1: 55 }, { x0: 124, x1: 129 }, { x0: 316, x1: 320 }, { x0: 519, x1: 520 }];

export function buildBuriedCity({ painter, T, TS }) {
  const { W, H, dune: DU, base: B, upper: U, hall: LH, corr: CO, sluice: SL, quarter: QS, low: LO, throne: TH } = BC;
  const L = painter(W, H), set0 = L.set, block0 = L.block, ent0 = L.ent;
  /* THE PAINTER ON LOGICAL ROWS (DY, above): every row given here lands DY lower in the grid; the roof and the shafts reach up to the grid's top row */
  const set = (x, y, v) => set0(x, y + DY, v), block = (x0, x1, y0, y1) => block0(x0, x1, y0 + DY, y1 + DY), ent = (t, x, y, o) => ent0(t, x, y + DY, o);
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const ground = (x0, x1, top) => block(x0, x1, top, H - 1 - DY);
  const roof = (x0, x1, bottom) => block(x0, x1, -DY, bottom);
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ face: -1, squad }, o || {}));
  /* THE CAST (every one a proven machine under a skin but the construct; L.foeHit / L.foeHp weigh them, A9 + difficulty v2: fewer, weightier) */
  const construct = (x, y, squad, o) => foe('construct', x, y, squad, o);                                                                     /* THE CLOCKWORK CONSTRUCT: the one new AI (src/construct.js) */
  const drowned = (x, y, squad, o) => foe('ambusher', x, y, squad, Object.assign({ cnSkin: 'sanddrowned' }, o || {}));                      /* THE SAND-DROWNED: the caravan's ambusher (it rises out of the sand as you come) */
  const slinger = (x, y, squad, o) => foe('slinger', x, y, squad, Object.assign({ cnSkin: 'sandslinger' }, o || {}));                       /* THE SAND-FOLK SLINGER: the ranged one (a man of the city's last folk) */
  const scorpion = (x, y, squad, o) => foe('scorpion', x, y, squad, Object.assign({ cnSkin: 'brassscorpion' }, o || {}));                   /* THE BRASS SCORPION: the city's clockwork vermin */
  const gear = (x, y) => ent('stray', x, y, { kind: 'gear' });
  const decor = [], interiors = [], vaultDoors = [], shade = [], crumbles = [], quicksand = [], structures = [], plats = [], lamps = [];
  /* THE CITY'S FOOTING (brief 4, PLATFORM VARIETY - not one plank): every built ledge says what it is (L.plats, for the art lane) and what holds it up (L.structures:
     a drawn support, tools/solid-islands.mjs). balcony: stone on corbels to the wall under it; awning: a stall's cloth on two poles; pipe: a brass pipe on brackets;
     beam: a roof beam hung on two chains from the sand roof; lintel: a fallen lintel in a wall; drum: a spire's fallen drum. The SOLID ones stand on the street:
     dome, minaret (a stub), house (a buried roof). */
  const cellL = (x, y) => L.grid[(y + DY) * W + x];   /* (a logical row's cell) */
  const groundBelow = (x, y) => { let b = y + 1; while (b < H - 1 - DY && cellL(x, b) === T.AIR) b++; return b; };
  const roofAbove = (x, y) => { let t = y - 1; while (t > -DY && cellL(x, t) === T.AIR) t--; return t; };
  const plat = (kind, x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); plats.push({ kind, x0, x1, y });
    if (kind === 'beam') structures.push({ kind: 'chains', x0, x1, top: roofAbove(x0, y), floor: y });
    else structures.push({ kind: 'bc' + kind[0].toUpperCase() + kind.slice(1), x0, x1, top: y, floor: Math.max(groundBelow(x0, y), groundBelow(x1, y)) }); };
  const solidPlat = (kind, x0, x1, y0, y1) => { block(x0, x1, y0, y1); plats.push({ kind, x0, x1, y: y0, y1 }); };
  const rotten = (x0, x1, y) => { plat('balcony', x0, x1, y); plats[plats.length - 1].kind = 'rotten'; crumbles.push({ x0, x1, row: y, rows: 1, count: 3 }); };
  const drift = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.AIR); quicksand.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: y * TS }); };
  const shadeBox = (x0, x1, y0, y1) => shade.push([x0 * TS, (x1 + 1) * TS, y0 * TS, (y1 + 1) * TS + 1]);
  const shaft = (x0, x1, bottom) => air(x0, x1, -DY, bottom);   /* a hole in the sand roof, open to the sky (L.sun names its columns) */
  const lamp = (x, y, kind) => lamps.push({ x, y, kind: kind || 'lamp' });

  // ================= 0. THE DUNES (0-47): the last of the sky, and the sinkhole down under the sand roof =================
  ground(0, 26, DU);
  sign(3, DU - 1, 'THE BURIED CITY. THE SAND POURS IN.');
  decor.push({ kind: 'spire', x: 8, y: DU - 1, h: 9 }, { kind: 'awning', x0: 13, x1: 17, y: 19 }, { kind: 'kinghead', x: 22, y: DU - 1 });   /* (B8) THE KING'S HEAD in the dune: his crown of gears and the hourglass at his throat, the first you see of him */
  shadeBox(13, 17, 20, DU - 1);                                                   /* a torn canopy on a spire's stump: shade on the dunes */
  plat('drum', 9, 12, 21);                                                         /* a spire's fallen drum (a second height) */
  plat('drum', 5, 8, 18); ent('silver', 6, 17);
  plat('drum', 17, 21, 20);                                                        /* a second drum by the king's head */                                    /* A SILVER on the spire's broken top (off the route: up off the drum) */
  ground(27, 30, 26); ground(31, 34, 28); ground(35, 38, 30); ground(39, 42, 32); ground(43, 47, 34); ground(48, 111, B);   /* THE SINKHOLE STAIR down into the street */
  roof(38, 111, 22);                                                               /* THE SAND ROOF: past the sinkhole the city is under it */
  decor.push({ kind: 'sinkhole', x0: 27, x1: 37 });
  plat('lintel', 40, 43, 28);                                                      /* a broken lintel in the sinkhole's wall (a second height on the stair) */
  plat('lintel', 28, 33, 23); plat('lintel', 34, 37, 26);                         /* and the sinkhole's broken lip over the stair */

  // ================= 1. THE SAND STAIR (48-111): TEACH - the first shaft of sun, the first sand room (its lever outside, nothing in reach of it) =================
  shaft(52, 55, 22);                                                               /* THE FIRST SHAFT: the roof has fallen in - the sun burns in it (cross it quick) */
  plat('balcony', 48, 51, 33); plat('beam', 56, 59, 33);                            /* a balcony by the shaft, a hung beam over the first lever */
  sign(49, B - 1, 'WHERE THE ROOF HAS FALLEN IN, THE SUN STILL BURNS.');
  /* THE FIRST SAND ROOM (TEACH, safe): full to the top of its doorways; its lever stands outside it on the street */
  roof(61, 74, 27); block(61, 61, 28, 32); block(74, 74, 28, 32); interiors.push([62, 73, 28, 35, 'bcRoom']);
  sign(60, B - 1, 'THE ROOMS FILL WITH SAND. E PULLS A SAND-GATE: THE ROOM DRAINS.');
  ent('sandlever', 58, B - 1, { room: 'first' }); ent('sandlever', 72, B - 1, { room: 'first', chain: 5 });
  lamp(58, 30);
  rotten(78, 82, 33); gear(80, 32);                                                /* GEAR ONE, on a ROTTEN balcony past the room (it gives way: cheap here, a drop to the street) */
  sign(84, B - 1, 'A DRIFT HOLDS YOU. JUMP, AND KEEP JUMPING.');
  drift(88, 90, B); plat('balcony', 86, 90, 33); decor.push({ kind: 'house', x0: 84, x1: 92, y: 33 });
  drowned(87, B - 1, 'firstDrift'); drowned(93, B - 1, 'firstDrift');             /* THE FIRST DROWNED: up out of the drift past the room (the road's first fight, out of the teach room's reach) */
  plat('balcony', 94, 99, 33); plat('pipe', 104, 111, 33);
  decor.push({ kind: 'mural', x0: 97, x1: 106, y: 31 });                           /* (B8) THE KING'S MURAL: the city kneeling to a king with an hourglass for a heart */
  lamp(101, 29, 'brazier');

  // ================= 2. THE BURIED BAZAAR (112-199): TEST - the sun lane and its awnings' shade, THE GRANARY's ride, the upper street's first construct =================
  ground(112, 139, B); roof(112, 240, 18);                                         /* the market hall: a higher roof */
  shaft(124, 129, 18);                                                             /* THE MARKET'S SUN LANE: the roof is open over the middle of the market */
  for (const [x0, x1] of [[114, 117], [122, 125], [130, 133]]) { plat('awning', x0, x1, 33); decor.push({ kind: 'stall', x0, x1, y: 33 }); shadeBox(x0, x1, 34, B - 1); }   /* the stalls: their cloths are ledges, and shade under them */
  plat('balcony', 118, 121, 30); plat('balcony', 134, 138, 30); plat('balcony', 113, 116, 27);   /* balconies over the stalls, and a high cornice */
  sign(119, B - 1, 'IN THE LIGHT THE SUN BURNS. UNDER THE STALLS IS SHADE.');
  slinger(136, 29, 'marketWatchSling'); scorpion(127, B - 1, 'marketWatch');      /* THE MARKET WATCH: a slinger on the balcony throws into the sun lane, a brass scorpion in it */
  /* THE GRANARY (TEST, RIDE IT UP): the way on is HIGH in its east wall; inside, its lever shuts the gate and the pour carries you up */
  block(140, 141, 19, 32); ground(140, 155, B); block(156, 156, 19, 24); ground(156, 156, U);   /* its walls: the west door at the floor (33-35), the east door high (25-27) */
  air(141, 141, 29, 31); gear(141, 31);                                            /* GEAR TWO in an ALCOVE in the west wall, open only to the room: for a hero who catches the sand there */
  interiors.push([142, 155, 19, 35, 'bcGranary']);
  sign(137, B - 1, 'THE WAY ON IS HIGH. SHUT THE GATE AND THE SAND CARRIES YOU UP.');
  ent('sandlever', 144, B - 1, { room: 'granary' });
  plat('beam', 149, 151, 24); slinger(150, 23, 'granarySling', { face: -1 });      /* a slinger on a hung beam: he throws while you rise (clear of the east wall: no shelf that dead-ends into it) */
  /* THE UPPER STREET (157-199): the market's roofs; the king's statue; the first construct */
  ground(157, 199, U);
  ent('check', 166, U - 1);                                                        /* CHECKPOINT ONE, past the granary */
  plat('balcony', 159, 163, 25); plat('balcony', 167, 172, 25);
  sign(161, U - 1, 'THE CITY\'S CONSTRUCTS: SAND IN THEIR GEARS JAMS THEM.');
  decor.push({ kind: 'kingstatue', x: 170, y: U - 1, h: 7 });                       /* (B8) THE HOURGLASS KING on his plinth, his glass full, his sceptre a pendulum */
  construct(176, U - 1, 'firstConstruct');                                        /* THE FIRST CONSTRUCT, in the open: its poke, its sweep */
  plat('pipe', 175, 179, 25); slinger(177, 24, 'upperWatch', { face: -1 });
  drift(181, 183, U);                                                              /* a drift under the slinger's pipe: in it, you are his mark */
  solidPlat('dome', 185, 190, 26, U - 1); decor.push({ kind: 'dome', x0: 185, x1: 190, y: 26 });   /* a buried DOME on the street: over it, not round it */
  plat('balcony', 186, 189, 23); plat('balcony', 188, 191, 20); ent('silver', 190, 19);   /* A SILVER on the dome's lantern, under the market roof (off the route: a climb off the dome) */
  drowned(194, U - 1, 'upperDrift'); plat('balcony', 192, 198, 25);

  // ================= 3. THE SINKING STREET (200-236): SET PIECE (NEW) - a buried street stands on a pit of sand: open its gate and it goes down a storey with you =================
  /* the pit (200-233), its floor row 39; ten rows of sand under the street (L.rooms 'street' - the hands write the sand AND the street's deck and roofs on it, so the
     grid as built is the pit DRAINED and empty). Its east wall stands from the roof to row 34: THE ARCH under it (rows 35-37) is the way on, and it is a storey down -
     the street must go down to it. The arch's top shows over the street (decor 'arch': its keystone and a lamp), so its target is in view before the pull */
  ground(200, 233, 39); block(234, 236, 19, 34); interiors.push([200, 233, 19, 38, 'bcStreetPit']);
  decor.push({ kind: 'arch', x0: 233, x1: 237, y0: 25, y1: 37 }); lamp(235, 24);
  sign(195, U - 1, 'THIS STREET STANDS ON THE SAND. OPEN ITS GATE AND IT SINKS - WITH YOU.');
  ent('sandlever', 197, U - 1, { room: 'street' }); ent('sandlever', 233, 37, { room: 'street', chain: 9 });
  construct(209, U - 1, 'deckGuard'); slinger(219, U - 5, 'deckSling', { face: -1 });   /* THE STREET'S WATCH rides it down: a construct on the street (jammed while it moves), a slinger on a roof */

  // ================= 4. THE HOURGLASS HALLS (237-336): REMIX - fill to cross the stakes; run the upper bulb down into the lower; the halls' exam =================
  ground(234, 245, LH); roof(237, 270, 26);
  plat('balcony', 239, 243, 35);
  drowned(241, LH - 1, 'archDrowned');                                             /* a drowned at the foot of the arch: the street's ride ends in a fight */
  /* THE SPIKE CELLAR (FILL TO CROSS): a pit of stakes between two lips; its lever on each lip; a slinger across it */
  ground(246, 259, 44); for (let x = 246; x <= 259; x++) set(x, 43, T.SPIKE);       /* (rows 38-43 the pit, stakes on its floor; the floor is row 44) */
  interiors.push([246, 259, LH, 43, 'bcCellar']);
  sign(238, LH - 1, 'SAND COVERS SPIKES. SHUT THE GATE AND WAIT FOR THE FILL.');
  ent('sandlever', 242, LH - 1, { room: 'cellar' }); ent('sandlever', 262, LH - 1, { room: 'cellar' });
  ground(260, 270, LH); plat('balcony', 264, 268, 35); slinger(266, 34, 'cellarSling', { face: -1 });   /* across the cellar: a slinger over its far lip */
  ground(271, 272, 35); ground(273, 281, CO); roof(271, 281, 27);                  /* up to the halls' corridor (row 32) */
  /* THE HOURGLASS: THE UPPER BULB (full, across the corridor) runs down into THE LOWER BULB (the pit after it) */
  ground(282, 292, CO); roof(281, 292, 23); block(281, 281, 24, 28); block(292, 292, 24, 28);   /* the upper bulb: doorways rows 29-31 both ends */
  interiors.push([282, 291, 24, 31, 'bcBulb']); gear(286, 31); plat('pipe', 284, 289, 28);   /* (a pipe shelf in the bulb: under its sand until it drains) */                   /* GEAR THREE, on the upper bulb's floor: the draining sand leaves it lying there */
  sign(275, CO - 1, 'THE HOURGLASS: THE UPPER HALL DRAINS INTO THE LOWER.');
  ent('sandlever', 278, CO - 1, { room: 'upperbulb' }); ent('sandlever', 290, CO - 1, { room: 'upperbulb', chain: 5 });
  ground(293, 293, CO); ground(294, 309, 42); ground(310, 336, CO); roof(293, 336, 25);   /* the lower bulb: a pit sixteen wide, its floor row 42 */
  interiors.push([294, 309, CO, 41, 'bcBulbLow']);
  plat('pipe', 304, 308, 39); plat('pipe', 306, 308, 36); plat('pipe', 307, 309, 33); plat('beam', 296, 300, 29);   /* the way up out of the lower bulb's floor (if you drop in before it fills) */
  construct(298, 41, 'bulbFloor', { face: 1 }); construct(304, 41, 'bulbFloor');  /* the lower bulb's watch: the sand that runs down carries them up JAMMED */
  /* THE HALLS' EXAM: an ELITE construct in a SHAFT OF SUN (316-320: fight him there and the sun drains you - draw him into the shade) with STAKES in the floor
     behind him (323-324: a heavy blow throws a foe onto them - src/knock-into.js; an elite takes a share and is put back) */
  shaft(316, 320, 25);
  air(323, 324, CO, CO + 1); set(323, CO + 2, T.SPIKE); set(324, CO + 2, T.SPIKE);
  sign(312, CO - 1, 'STAKES IN THE FLOOR: A HEAVY BLOW THROWS A FOE ONTO THEM.');
  construct(318, CO - 1, 'hallsEnd', { elite: true }); drowned(321, CO - 1, 'hallsEnd');   /* (and a drowned by the stakes: a heavy blow throws HIM onto them - INTO THE SPIKES; the construct is too heavy to throw) */
  rotten(311, 315, 28);                                                            /* a ROTTEN balcony over the halls' corridor */
  ent('check', 329, CO - 1); plat('beam', 326, 332, 28);                                                        /* CHECKPOINT TWO, after the halls' exam */
  ground(337, 340, LH); roof(337, 340, 27);                                        /* (the corridor's end drops to the sluice's door) */

  // ================= 5. THE SAND-FALL (337-395): SET PIECE (NEW) - the sluice hall: swing the fall onto the wall, let it pile, swing it back, climb to the arch =================
  /* the hall (341-379), floor row 42; the way on is THE HIGH ARCH in its east wall (rows 31-33, its sill row 34 - eight rows over the floor: no jump reaches it).
     A crack in the roof over 366 pours THE SAND-FALL; its CHUTE (L.chutes 'sluice') lands it on THE GRATE (352-354: the sand runs away) or by THE WALL (377-379:
     it HEAPS, two rows to a step, up to the arch's sill). In the fall you are beaten down - so swing it in, let it pile, swing it back off the heap, and climb */
  ground(341, 379, SL); roof(341, 380, 24); block(380, 380, 25, 30); ground(380, 380, 34);
  interiors.push([341, 379, 25, 41, 'bcSluice']);
  decor.push({ kind: 'grate', x0: 352, x1: 354, y: SL }, { kind: 'arch', x0: 379, x1: 382, y0: 28, y1: 33 }); lamp(381, 29);
  sign(342, SL - 1, 'THE CHUTE LEVER SWINGS THE SAND-FALL: WHERE IT LANDS, THE SAND PILES UP.');
  ent('sandchute', 345, SL - 1, { chute: 'sluice' }); ent('sandchute', 366, SL - 1, { chute: 'sluice' });
  plat('balcony', 344, 348, 38); gear(346, 37);                                    /* GEAR FOUR, on the sluice keeper's balcony */
  plat('pipe', 355, 363, 39);
  drowned(350, SL - 1, 'sluiceDrift'); scorpion(360, SL - 1, 'sluiceVermin');
  construct(375, SL - 1, 'sluiceFloor');                                           /* a construct where the heap rises: the fall buries it to the gears (JAMMED) */
  ground(381, 395, 34); roof(381, 395, 29); plat('pipe', 386, 392, 31);           /* THE ARCH's corridor */
  slinger(384, 33, 'archSling', { face: -1 });                                     /* a slinger in the arch: he throws down into the hall while you work the chute */

  // ================= 6. THE DROWNED QUARTER (396-512): SET PIECE - THE GREAT SAND-GATE (REQUIRED); the foundry yard =================
  ground(396, 410, QS); roof(396, 467, 20);
  sign(399, QS - 1, 'THE GREAT SAND-GATE: E TURNS THE WHEEL. IT DRAINS THE WHOLE QUARTER.');
  ent('sandwheel', WHEEL.x, WHEEL.row - DY, { room: 'great' }); plat('balcony', 398, 402, 33); lamp(405, 30, 'brazier');
  /* the quarter: the old street at row 44, under twenty rows of sand on a fresh load (L.rooms 'great'); its east door (rows 40-43) is the only way on */
  ground(411, 467, LO); block(467, 467, 21, 39);
  interiors.push([411, 466, 21, 43, 'bcQuarter']);
  /* its ruins: houses, a tower, balconies - footing at three heights once the sand is gone */
  solidPlat('house', 420, 423, 41, 43); plat('balcony', 424, 428, 38); solidPlat('house', 430, 432, 35, 43); plat('balcony', 433, 437, 32); gear(435, 31);   /* GEAR FIVE, up the ruined houses' balconies */
  solidPlat('house', 444, 447, 41, 43); plat('balcony', 448, 452, 38); solidPlat('house', 454, 457, 35, 43); solidPlat('minaret', 460, 462, 33, 43); plat('beam', 458, 459, 35); plat('beam', 458, 459, 39);   /* (a fallen beam over the well between the house and the tower, and a step in it) */
  decor.push({ kind: 'greatgate', x0: 438, x1: 442, y: LO }); plat('pipe', 438, 442, 40); plat('beam', 419, 423, 37); plat('beam', 443, 447, 37);   /* the great gate's housing: a step over its grille */
  /* the quarter's dormant watch and its drowned: under the sand on a fresh load - the hands stand them up when the sand has gone off them (sandWait) */
  construct(440, LO - 1, 'quarterWatch', { sandWait: 'great', dormant: true }); construct(464, LO - 1, 'quarterWatch2', { sandWait: 'great' });
  drowned(416, LO - 1, 'quarterDrift', { sandWait: 'great' }); drowned(450, LO - 1, 'quarterDrift2', { sandWait: 'great' }); slinger(455, 34, 'quarterSling', { sandWait: 'great' });
  /* THE FOUNDRY YARD (468-512): the old street east of the quarter, brass pipes overhead */
  ground(468, 512, LO); roof(468, 512, 32);
  plat('pipe', 469, 473, 41); plat('pipe', 475, 479, 38); plat('pipe', 487, 491, 41); plat('pipe', 493, 497, 38); plat('balcony', 503, 507, 41);
  drift(490, 492, LO);                                                             /* a drift in the foundry yard, by the elite */
  construct(484, LO - 1, 'foundry', { elite: true }); slinger(489, 40, 'foundrySling');   /* THE QUARTER'S EXAM: an ELITE construct with the drift at his back (held in it, you are his mark) and a slinger over it */
  /* THE FOUNDRY'S FLOOR-GATE (the TEACH of the trap hall): a small OPEN floor-gate in the yard's street (498-500): a drop of three rows onto the foundry's floor -
     a quarter of you and back to the lip (src/buried-city-hands.js dropBack). Its lever on the west lip shuts it and the sand bridges it */
  air(498, 500, LO, LO + 2);
  ent('sandlever', 496, LO - 1, { room: 'yard' });
  sign(493, LO - 1, 'AN OPEN FLOOR-GATE IS A DROP. SHUT IT AND THE SAND BRIDGES IT.');
  ent('check', 506, LO - 1);                                                        /* CHECKPOINT THREE, after the quarter's exam and the floor-gate's teach (tools/checkpoint-gaps: 200 route tiles at most - the sand-fall's climb and the quarter's ruins fill them) */

  // ================= 7. THE THRONE STREET (513-629): THE EXAM - ride the shaft through the sun; feed the trap hall under a squad; the throne's warden =================
  /* THE CLOCK SHAFT (RIDE IT UP): the old street's end is a shaft; its way on is high in its east wall (rows 29-31); the roof over it is holed (519-520): ride
     the sand up in the light and the sun burns you - stand clear of the shaft of it */
  ground(513, 525, LO); block(513, 513, 21, 40); roof(513, 526, 20); block(526, 526, 21, 28); ground(526, 526, TH);
  shaft(519, 520, 20);
  interiors.push([514, 525, 21, 43, 'bcShaft']);
  ent('sandlever', 516, LO - 1, { room: 'shaft' });
  plat('beam', 521, 525, 28); slinger(523, 27, 'shaftSling', { face: -1 });       /* a slinger on a hung beam over the full sand */
  drowned(519, LO - 1, 'shaftDrift');                                              /* a drowned in the shaft's floor: it rides the sand up with you */
  /* THE THRONE STREET (527-629, row 32) */
  ground(527, 545, TH); roof(527, 629, 20);
  plat('balcony', 531, 535, 29);
  /* THE TRAP HALL (THE EXAM, REQUIRED): its floor-gate is OPEN - a drop to the end - and the roof's SAND-FALL lands on the lip, where a construct stands held in it.
     SHUT THE FLOOR-GATE (544) AND SWING THE FALL INTO THE HALL (538): only then does it fill, and you walk over. Swing it first and the sand falls through into the
     dark; and the moment it leaves the lip, the construct it held is free */
  air(546, 559, TH, H - 1); interiors.push([546, 559, TH, 45, 'bcTrap']);
  sign(536, TH - 1, 'THE CHUTE LEVER SWINGS THE SAND-FALL INTO THE HALL.');
  sign(543, TH - 1, 'THE TRAP HALL\'S FLOOR-GATE IS OPEN: A FALL HERE IS THE END.');
  ent('sandchute', 538, TH - 1, { chute: 'trapfall' });
  ent('sandlever', 544, TH - 1, { room: 'trap' }); ent('sandlever', 562, TH - 1, { room: 'trap' });
  construct(541, TH - 1, 'trapLip', { face: 1 }); drowned(543, TH - 1, 'trapLip');   /* THE EXAM's construct on the lip, in the fall (JAMMED while it holds him), and a drowned on the lip's edge: a heavy blow throws him OFF THE EDGE */
  ground(560, 629, TH); plat('balcony', 565, 569, 29); slinger(567, 28, 'trapSling', { face: -1 });   /* across the hall: a slinger on a balcony */
  /* THE KING'S COURT: his kneeling courtiers (the drowned of his court, stone now), his statues, and THE THRONE'S WARDEN */
  decor.push({ kind: 'courtiers', x0: 563, x1: 579, y: TH - 1 }, { kind: 'kingstatue', x: 593, y: TH - 1, h: 9 }, { kind: 'kingstatue', x: 612, y: TH - 1, h: 9 });
  drift(575, 577, TH); plat('balcony', 576, 580, 29);
  construct(582, TH - 1, 'throneGuard', { elite: true, gate: 589 }); scorpion(586, TH - 1, 'throneGuard');
  plat('balcony', 583, 587, 26); slinger(585, 25, 'throneGuardSling');             /* THE THRONE'S WARDEN (an ELITE construct: his gate at 589 shuts the street until he falls - the drift at your back), a scorpion, a slinger over them */
  /* THE CLOCKWORK VAULT: a low cellar under the street, WEST of a hatch in it (drop in; its door opens on five gears). The cellar is two rows deep and ends at
     the hatch's east edge, and a one-way step stands under the hatch: a hero who drops in by mistake lands on it, two rows under the street */
  air(606, 607, TH, TH); air(600, 607, TH + 1, TH + 2); plat('lintel', 606, 607, TH + 2);   /* the hatch, the cellar (floor row 35), the step under the hatch */
  block(603, 603, TH + 1, TH + 2); interiors.push([604, 607, TH + 1, TH + 2, 'bcVaultHall'], [600, 602, TH + 1, TH + 2, 'bcVault']);
  vaultDoors.push({ id: 'clockwork', x: 603, y0: TH + 1, y1: TH + 2, gears: 5 }); ent('gearvault', 603, TH + 2, { id: 'clockwork' }); ent('silver', 601, TH + 2);
  sign(610, TH - 1, 'THE CLOCKWORK VAULT, DOWN THE HATCH. FIVE GEARS OPEN ITS DOOR.');
  rotten(614, 618, 29); plat('balcony', 623, 627, 29);                             /* a ROTTEN balcony and a sound one by the throne door */
  drowned(616, TH - 1, 'courtLast');                                               /* the last of his court, up out of the sand at the throne door */
  ent('check', 621, TH - 1);                                                        /* CHECKPOINT FOUR, before the king (after the exam) */
  lamp(625, 26, 'brazier');
  decor.push({ kind: 'relief', x0: 616, x1: 628, y: 26 });                         /* (the next road) THE SEALED PYRAMID carved over the throne door: a tomb with a scarab on its seal */

  // ================= THE HOURGLASS KING's THRONE ROOM (src/hourglass-king.js), at the foot of the Hourglass Tower =================
  const AX = 630;
  const stage = stageHourglassKing({ set: set0, block: block0, ent: ent0, air: (x0, x1, y0, y1) => air(x0, x1, y0 - DY, y1 - DY) }, T, TS, AX, TH + DY);   /* (his stage is laid in GRID rows: its arena is px) */
  ground(AX, AX + HK_STAGE.W - 1, TH);
  block(AX + HK_STAGE.W, W - 1, -DY, H - 1 - DY);
  stage.carve();
  for (const l of HK_STAGE.ledges) structures.push({ kind: 'chains', x0: AX + l.x0, x1: AX + l.x1, top: TH - 19, floor: TH - l.dy });   /* his two ledges hang on chains from the throne room's roof (the art pass draws them) */
  roof(AX - 1, AX + HK_STAGE.W, TH - 19);                                         /* the city's sand over the throne room's roof (its roof is not a slab in the air) */
  ent('gate', AX + HK_STAGE.W - 2, TH - 1);

  /* THE SAND'S BOXES for the reach model (src/reachcore.js, L.buriedcity): FILL-TO-CROSS rooms count as full, RIDE rooms (and the sinking street) as a stair of
     rungs three rows apart, THE SAND-FALL's heap as built up (its rungs). The grid itself is every room DRAINED and every heap flat (the hands write the sand in
     on load): nothing spawns inside sand, and the tools see the street */
  const sandSolid = ROOMS.filter(r => r.need).map(r => [r.x0, r.x1, r.floor - r.full, r.floor - 1]);
  for (const c of CHUTES) for (const t of Object.values(c.to)) if (t.kind === 'mound') for (const [j, x0, x1] of t.rungs) sandSolid.push([x0, x1, t.floor - j, t.floor - j]);
  const sandRungs = ROOMS.filter(r => r.use === 'ride' || r.use === 'sink').map(r => [r.x0, r.x1, r.floor - r.full, r.floor - 1]);
  /* THE LAID STONE: every column of the city from the first row under its sand roof down (a run of columns with the same roof is one rectangle) */
  /* THE DATA ROWS TO THE GRID'S (+DY) */
  for (const d of decor) for (const k of ['y', 'y0', 'y1']) if (typeof d[k] === 'number') d[k] += DY;
  for (const q of quicksand) q.y += DY * TS; for (const s of shade) { s[2] += DY * TS; s[3] += DY * TS; } for (const c of crumbles) c.row += DY;
  for (const z of structures) { z.top += DY; z.floor += DY; } for (const p of plats) { p.y += DY; if (p.y1 !== undefined) p.y1 += DY; } for (const lp of lamps) lp.y += DY;
  for (const it of interiors) { it[2] += DY; it[3] += DY; } for (const v of vaultDoors) { v.y0 += DY; v.y1 += DY; }
  const masonry = []; { const roofEnd = x => { let y = 0; while (y < H && L.grid[y * W + x] !== T.AIR) y++; return y; };
    for (let x = 38; x < W; ) { const y0 = roofEnd(x); let x1 = x; while (x1 + 1 < W && roofEnd(x1 + 1) === y0) x1++; if (y0 < H) masonry.push([x, x1, y0, H - 1]); x = x1 + 1; } }
  const START = { x: 3, y: DU - 1 + DY };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: [], interiors, structures,
    arena: stage.arena, gateAfterBoss: true,
    buriedcity: true, caravan: true,   /* caravan: the desert's hands in main.js (the bandits' and scorpions' machines, the sand and stone skins, THE SUN - here only on the dunes and in the shafts) */
    rooms: ROOMS.map(r => ({ ...r, levers: r.levers.map(a => a.slice()), deck: r.deck ? r.deck.map(a => a.slice()) : undefined })),
    chutes: CHUTES.map(c => ({ ...c, levers: c.levers.map(a => a.slice()), to: JSON.parse(JSON.stringify(c.to)), other: { ...c.other } })),
    wheel: { ...WHEEL }, arenaLevers: stage.levers, vaultDoors, decor, sandSolid, sandRungs, crumbles, quicksand, plats, lamps,
    /* THE CITY HITS HARD (difficulty v2: weight, not numbers of foes): a blow x this on top of the act's tier, by skin (main.js damagePlayer0 reads L.foeHit) */
    knockHazards: [],   /* (claude/knockinto: the city's killing hazards - the stakes, the trap hall's open drop - are tiles and a drop the shared helper reads already; the foes that can be thrown stand by them: the halls' drowned, the trap lip's drowned. The construct is too heavy to throw - KNOCK_SKIP) */
    foeHit: { sanddrowned: 5.4, sandslinger: 2.3, brassscorpion: 4.8 },   /* (claude/buriedcity2: the L40 walker arrived 73-97% - drowned 4.6 -> 5.4, slinger 1.8 -> 2.3, scorpion 4.2 -> 4.8) */
    foeHp: { sanddrowned: 3.2, sandslinger: 2.2, brassscorpion: 3.0 },
    alarms: ROOMS.map(r => ({ x0: r.x0, x1: r.x1 })).concat(CHUTES.flatMap(c => Object.values(c.to).map(t => ({ x0: t.x0 - 4, x1: t.x1 + 4 })))),   /* THE RULE'S STATE for tools/rule-state.mjs: the sand rooms and the falls are where the rule is live */
    sun: SUN.map(z => ({ ...z })), shade, shadeArt: shade,   /* THE DESERT'S SUN on the dunes and in the shafts only (the city is under its roof): src/buried-city-hands.js sunAt */
    noSkyRays: true,   /* (the sky's rays are the dunes' and the shafts' only: src/redraw/buried_city_backdrop.js draws the shafts' light) */
    quest: { n: 5, item: 'gear', name: 'GEARS', done: 'FIVE GEARS: THE CLOCKWORK VAULT OPENS', thanks: 'THE CLOCKWORK VAULT OPENS' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,   /* (A10b: a shrine a section - 166, 329, 506, 621) */
    unlocks: [
      { kind: 'sandlever', opens: 'a sand room\'s floor-gate: open, the room drains (a full doorway opens, a street on the sand sinks); shut, it fills and carries you up (a high door, a crossing over spikes or a drop)', hud: 'THE GATE IS OPEN: THE ROOM DRAINS / THE GATE IS SHUT: THE SAND RISES' },
      { kind: 'sandchute', opens: 'a SAND-FALL\'s chute: it swings the fall to its other place - where it lands the sand piles up (a stair to a high arch) or feeds a room', hud: 'THE CHUTE SWINGS' },
      { kind: 'sandwheel', opens: 'THE GREAT SAND-GATE: three turns drain the whole Drowned Quarter, and its old street\'s door is the only way on', hud: 'THE GREAT GATE OPENS A NOTCH' },
      { kind: 'stray', opens: 'THE CLOCKWORK VAULT by the throne-hall door once all five gears are carried (a silver)', hud: 'GEARS n/5 - THE CLOCKWORK VAULT WAITS (the quest counter)' },
    ],
    music: 'buriedcity',
    ambient: [{ x0: 0, x1: 99999, kind: 'buriedcity' }],   /* its own bed: src/audio.js SYNTH_BEDS.buriedcity (the sand's hiss, a far chime, the gears) */
    rockZones: [], masonry,   /* the city is laid sandstone UNDER ITS SAND ROOF: main.js paints it as coursed masonry; the roof (the top run of rock in each column) is the dunes' sand, natural rock the city's walls hang from (tools/architecture.mjs) */
    palette: { set: 'desert', near: 'none', dress: 'none', noFg: true, noNear: true, haze: 'rgba(200,150,90,0.06)' },
    duskStart: -1, duskLen: 1,
  };
}
