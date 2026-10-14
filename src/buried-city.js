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
// THE RULE: PULL A SAND-GATE AND A ROOM DRAINS; SHUT IT AND THE SAND RISES AND CARRIES YOU. STRIKE AN HOURGLASS AND THE SAND RUNS BACKWARD.
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
//   409-467  THE SAND-FALL          SET PIECE (NEW) the sluice hall: swing the fall onto the wall, let it pile, swing it back, climb to the arch
//   468-584  THE DROWNED QUARTER    SET PIECE THE GREAT SAND-GATE (REQUIRED); the foundry yard (an open floor-gate taught safe) and its ELITE with a drift by him
//   585-701  THE THRONE STREET      EXAM     THE CLOCK SHAFT (ride it up through the sun), THE TRAP HALL (shut its floor-gate AND swing the fall in, under a
//                                            construct the fall holds and a slinger; open, a fall is the end), THE THRONE'S WARDEN (ELITE, gate), the vault
//   702-741  THE THRONE ROOM        BOSS     THE HOURGLASS KING (src/hourglass-king.js stageHourglassKing), at the foot of the Hourglass Tower
import { stageHourglassKing, HK_STAGE } from './hourglass-king.js';

/* THE ROWS BELOW ARE LOGICAL: the city is laid on them and the build sets it ONE ROW LOWER in the grid (DY: one more row of sand roof over everything), so every
   street's feet stand on the top row of a four-row height band (the dunes' 24, the street's 36, the upper street's 28, the halls' corridor 32, the old street's 44)
   and a balcony three rows up is a second height (tools/level-quality.mjs bands). The exported ROOMS, CHUTES, WHEEL and the built level are in GRID rows (+DY) */
export const DY = 1;
export const BC = { W: 887, H: 49, dune: 24, base: 36, upper: 28, hall: 38, corr: 32, sluice: 42, quarter: 36, low: 44, throne: 32 };
export const SECTIONS = [['THE DUNES', 0], ['THE SAND STAIR', 48], ['THE BURIED BAZAAR', 112], ['THE SINKING STREET', 200], ['THE HOURGLASS HALLS', 237], ['THE SAND-FALL', 409], ['THE DROWNED QUARTER', 468], ['THE THRONE STREET', 585], ['THE ROOFTOPS', 702], ['THE THRONE ROOM', 845]];
export const RULE = 'PULL A SAND-GATE AND A ROOM DRAINS; SHUT IT AND THE SAND RISES AND CARRIES YOU. STRIKE AN HOURGLASS AND THE SAND RUNS BACKWARD.';   /* (claude/buriedcity3: THE FLIP is the rule's second half - the line says what the code does, A1) */
/* each use's arc (tile columns) - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/buried-city.mjs */
export const ARCS = {
  drain: { teach: [56, 74], test: [274, 292], remix: [468, 539], exam: [585, 598], boss: [845, 884] },   /* the first room; the upper bulb; THE GREAT SAND-GATE (required); the shaft's drop back; the king's glass */
  ride: { teach: [138, 156], remix: [196, 236], test: [585, 598] },                                    /* THE GRANARY; THE SINKING STREET (it rides you DOWN); THE CLOCK SHAFT (through the sun) */
  fill: { teach: [237, 262], remix: [293, 310], exam: [608, 634] },                                    /* THE SPIKE CELLAR; the lower bulb; THE TRAP HALL (required) */
  fall: { teach: [409, 452], exam: [608, 634] },                                                        /* THE SAND-FALL (required: pile it to the arch); THE TRAP HALL (feed it) */
  sun: { teach: [48, 56], test: [112, 138], remix: [311, 324], exam: [585, 598] },                      /* cross a shaft; the market's awnings are shade; the halls' elite in the light; the clock shaft's ride */
  flip: { teach: [98, 111], test: [309, 316], remix: [710, 784], exam: [785, 821], boss: [845, 884] },   /* (claude/buriedcity3) THE FLIP: a roof rises (safe, required); a bank runs out; the fall flows up + the chain of two glasses; the glass that sinks one roof and raises the rest over the end; the king's great glass */
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
  { id: 'great', x0: 483, x1: 538, floor: 44, full: 20, init: 'full', levers: [], pour: false, fill: 0, drain: 3.0, use: 'drain', great: true, door: [539, 40, 43] },
  { id: 'yard', x0: 570, x1: 572, floor: 46, full: 2, init: 'empty', levers: [[568, 43]], pour: true, fill: 1.4, drain: 3.0, use: 'fill', trap: true, teach: true, lips: [568, 574] },   /* THE FOUNDRY'S FLOOR-GATE: the trap hall taught safe (a three-row drop onto the foundry's floor: a quarter of you and back to the lip) */
  { id: 'shaft', x0: 586, x1: 597, floor: 44, full: 12, init: 'empty', levers: [[588, 43]], pour: true, fill: 1.2, drain: 2.4, use: 'ride', door: [598, 29, 31] },
  { id: 'trap', x0: 618, x1: 631, floor: 46, full: 14, init: 'empty', levers: [[616, 31], [634, 31]], pour: false, fedBy: 'trapfall', fill: 2.2, drain: 3.0, use: 'fill', need: true, trap: true, lamps: [617, 632] },
];
/* THE SAND-FALLS: a crack in the sand roof at col x pours a FALL (from row roof+1) that a CHUTE swings between two places it lands, [x0, x1] the fall's columns:
   'grate' a floor grille (the sand runs away under it), 'lip' a street (the sand runs off it), 'mound' a HEAP that piles up where it lands ([row above the floor,
   x0, x1] rungs, a row a beat while the fall is on it; the heap stays until a respawn), 'room' a sand room it feeds (fedBy). A hero in the fall is beaten down (he
   cannot rise in it, and walks slow - no blow, no damage), a construct in it is JAMMED. levers: the chute levers (E swings it to the other place) */
const CHUTES_RAW = [
  { id: 'sluice', x: 438, roof: 24, at: 'grate', levers: [[417, 41], [438, 41]],
    to: { grate: { x0: 424, x1: 426, kind: 'grate', floor: 42 }, wall: { x0: 449, x1: 451, kind: 'mound', floor: 42, rate: 2.0,
      rungs: [[1, 440, 451], [2, 440, 451], [3, 443, 451], [4, 443, 451], [5, 446, 451], [6, 446, 451], [7, 449, 451], [8, 449, 451]] } }, other: { grate: 'wall', wall: 'grate' } },
  { id: 'trapfall', x: 620, roof: 20, at: 'lip', levers: [[610, 31]],
    to: { lip: { x0: 612, x1: 614, kind: 'lip', floor: 32 }, hall: { x0: 623, x1: 625, kind: 'room', room: 'trap' } }, other: { lip: 'hall', hall: 'lip' } },
];
/* (in GRID rows: + DY) */
export const ROOMS = ROOMS_RAW.map(r => ({ ...r, floor: r.floor + DY, levers: r.levers.map(([x, row, ch]) => (ch ? [x, row + DY, ch] : [x, row + DY])), door: r.door ? [r.door[0], r.door[1] + DY, r.door[2] + DY] : undefined, spikes: r.spikes ? r.spikes + DY : undefined }));
export const CHUTES = CHUTES_RAW.map(c => ({ ...c, roof: c.roof + DY, levers: c.levers.map(([x, row]) => [x, row + DY]), to: Object.fromEntries(Object.entries(c.to).map(([k, t]) => [k, { ...t, floor: t.floor !== undefined ? t.floor + DY : undefined }])) }));
export const WHEEL = { x: 477, row: 35 + DY, room: 'great', turns: 3 };
/* THE SHAFTS OF SUN: where the sand roof has fallen in (open to the sky, the only daylight in the city) - THE SUN's drain (src/sun-hands.js) lives here and on the dunes */
/* THE ROOFTOPS (claude/buriedcity3): the columns OUTSIDE, under the open sky */
export const OUT = { x0: 702, x1: 821 };
export const SUN = [{ x0: 0, x1: 37 }, { x0: 52, x1: 55 }, { x0: 124, x1: 129 }, { x0: 316, x1: 320 }, { x0: 591, x1: 592 }, { x0: 702, x1: 821 }];

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
  const sandBound = (x, y, glassId, squad, o) => foe('ambusher', x, y, squad, Object.assign({ cnSkin: 'sandbound', glass: glassId }, o || {}));   /* (claude/buriedcity4) THE SAND-BOUND: the drowned's machine, bound to a glass (the variant: the level keeps ONE new foe, the construct) */
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
  /* THE FLIP (claude/buriedcity3): the hourglasses and what each one turns (logical rows; the hands write them - src/buried-city-hands.js). glass: one on a brass
     stand, its feet on row y, dur s of backward sand. riser: a buried roof whose top rises to row top (rows tall) while its glass runs (AIR as built: it is under
     the sand). bank: a drift wall (sand as the hands write it) that runs out while its glass runs. dfall: a sand-fall off a dune's lip that flows UP while its
     glass runs (a body in it is carried up; idle it beats you down). sea: THE SAND SEA - deep sand between the rooftops (a void under its drawn surface: who sinks
     into it is swallowed - a bite of him and back to his last footing, or in the exam the end). sinker: footing that stands as built and SINKS while its glass runs */
  const glasses = [], risers = [], banks = [], dfalls = [], seas = [];
  const glass = (id, x, y, dur) => glasses.push({ id, x, y, dur });
  const riser = (g, x0, x1, top, rows, kind, o) => { risers.push(Object.assign({ glass: g, x0, x1, top, rows, kind: kind || 'roof' }, o || {})); plats.push({ kind: kind || 'house', x0, x1, y: top, y1: top + rows - 1, riser: true }); };
  const sinker = (g, x0, x1, top, rows, kind) => { block(x0, x1, top, top + rows - 1); riser(g, x0, x1, top, rows, kind, { sinks: true }); plats[plats.length - 1].riser = false;
    structures.push({ kind: 'bcBuried', x0, x1, top, floor: top + rows - 1 }); };
  const bank = (g, x0, x1, y0, y1) => banks.push({ glass: g, x0, x1, y0, y1 });
  const dfall = (g, x0, x1, top, bottom) => dfalls.push({ glass: g, x0, x1, top, bottom });
  const sea = (x0, x1, row, lethal, bottom) => seas.push(Object.assign({ x0, x1, row, lethal: !!lethal }, bottom !== undefined ? { bottom } : {}));   /* (claude/buriedcity4: bottom - the sea's floor row, a SEA with a street under it: who is below it is not in it) */
  /* a buried house's roof, a dome, a minaret stub standing up out of THE SAND SEA (its body runs down into the sand: a declared structure) */
  const isle = (kind, x0, x1, top, rows) => { solidPlat(kind, x0, x1, top, top + rows - 1); structures.push({ kind: 'bcBuried', x0, x1, top, floor: top + rows - 1 }); };   /* (its frame is its own cells - tools/architecture.mjs: it stands on itself; the hands draw its walls on down into the sand) */
  /* (claude/buriedcity4, BURIED CITY 4) THE FLIP'S NEW PIECES:
     tilt: A DUNE THAT TILTS WITH THE GLASS (brief 8, src/slopes.js tiles) - a steep sand ramp over x0..x1 whose LOW end's surface is row lo and whose rock runs down to row
       floor. While its glass runs it RISES EAST (the way it is laid here: the reach model and the tools see the route); idle it is MIRRORED (rises west - from the low
       side a wall). The hands write it idle at load and turn it with the glass (src/buried-city-flip.js). Downhill it is a run, uphill a crawl (the slopes engine).
     tplat: A TIMED SAND PLATFORM (brief 9, the King's preview): a slab of sand that rises when its glass is struck and CRUMBLES life s later, its own timer drawn over it
       (they are AIR as built; the reach model counts them up).
     sandBound: THE SAND-BOUND (brief 2): the sand-drowned's machine (the ambusher, cnSkin 'sandbound') bound to a glass - while its glass rests THE SAND HOLDS IT
       (it takes 0.4 of a blow, told: a clank and THE SAND HOLDS IT); strike the glass and it is BURIED to the chest - stuck, and every blow lands whole */
  const tilts = [], tplats = [];
  const tilt = (g, x0, x1, lo, floor) => { tilts.push({ glass: g, x0, x1, lo, floor }); for (let i = 0; i <= x1 - x0; i++) { set(x0 + i, lo - 1 - i, T.SLOPE_R1); block(x0 + i, x0 + i, lo - i, floor); }
    plats.push({ kind: 'dune', x0, x1, y: lo - (x1 - x0 + 1), y1: floor, riser: true }); structures.push({ kind: 'bcBuried', x0, x1, top: lo - (x1 - x0 + 1), floor }); };
  const tplat = (g, x0, x1, y, life) => { tplats.push({ glass: g, x0, x1, y, life }); plats.push({ kind: 'sandslab', x0, x1, y, riser: true }); };

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
  drowned(87, B - 1, 'firstDrift'); drowned(91, B - 1, 'firstDrift');             /* THE FIRST DROWNED: up out of the drift past the room (the road's first fight, out of the teach room's reach) */
  plat('balcony', 94, 97, 33);
  decor.push({ kind: 'mural', x0: 97, x1: 106, y: 31 });                           /* (B8) THE KING'S MURAL: the city kneeling to a king with an hourglass for a heart */
  lamp(101, 29, 'brazier');
  /* THE FIRST HOURGLASS (claude/buriedcity3, THE FLIP - TEACH, safe and REQUIRED): a buried house has fallen across the street (108-111, five rows: no jump
     clears it). Strike the hourglass by it and the sand runs back up: A BURIED ROOF RISES out of the street's sand (104-106, three rows) - a step onto the house.
     When the glass runs out it sinks again (a three-row drop to the street: nothing is lost). No foe in reach of it */
  solidPlat('house', 108, 111, 31, B - 1);
  sign(98, B - 1, 'STRIKE THE HOURGLASS: THE SAND RUNS BACK UP, AND A BURIED ROOF RISES.');
  glass('stair', 102, B - 1, 10); riser('stair', 104, 106, 33, 3, 'house');

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
  /* THE SECOND HOURGLASS (claude/buriedcity3, THE FLIP - TEST: a new use): a BANK of drifted sand shuts the corridor wall to wall (314-315) before the halls'
     exam. Strike the glass and the sand runs out of it - for six seconds; then it drifts back in behind you (never on a body: it waits till the bank is clear) */
  sign(310, CO - 1, 'A BANK OF SAND SHUTS THE HALL. STRIKE THE HOURGLASS: IT RUNS OUT.');
  glass('bank', 311, CO - 1, 6); bank('bank', 314, 315, 26, CO - 1);
  ent('check', 329, CO - 1); plat('beam', 326, 332, 28);                                                        /* CHECKPOINT TWO, after the halls' exam */

  // ================= 4b. THE GLASS WORKS (337-408, claude/buriedcity4 - NEW): the glassblowers' hall where the city's hourglasses were made, under the sand roof.
  //    BRIEF 1 (A14 teach before test): THE FLIP AS PLATFORMING, indoors and in the first half - floors that SINK while others RISE, a SAND-FALL LIFT you ride up
  //    (brief 7), a DUNE THAT TILTS (brief 8), the first SAND-BOUND (brief 2: the glass is your weapon), and its own small EXAM (a relay of two glasses down to the
  //    floor, a sand-bound at its foot and a slinger over it) with a shrine after. Under it all THE GLASS PIT - the sand sea indoors (a bite and back to the last
  //    footing that does not move: taught here, before the rooftops). THE ROOFTOPS then test and remix every piece of it.
  roof(337, 408, 4); interiors.push([337, 408, 5, 40, 'bcWorks']);
  ground(337, 340, CO);                                                            /* the halls' corridor runs in: the kiln floor's lip */
  sign(337, CO - 1, 'THE GLASS WORKS. A STRUCK GLASS RAISES SOME FLOORS AND SINKS OTHERS.');
  lamp(338, 27, 'brazier');
  /* BEAT ONE - RISE AND SINK: two buried roofs stand over the pit to a kiln's chimney; its glass SINKS them behind you and RAISES two roofs up to the gallery */
  sea(341, 349, 40); sinker('works1', 342, 344, CO, 2, 'house'); sinker('works1', 346, 348, CO, 2, 'house');
  isle('minaret', 350, 351, CO, 9); glass('works1', 351, CO - 1, 8);
  sea(352, 360, 40); riser('works1', 353, 355, 30, 2, 'house'); riser('works1', 357, 359, 28, 2, 'house');
  isle('house', 361, 367, 26, 15);                                                 /* THE GALLERY (row 26): a kiln's flat top */
  /* BEAT TWO - THE SAND LIFT: a sand-fall from a crack in the roof; idle it beats you down into the pit, its glass turns it UP - step in and it carries you eleven
     rows to the upper gallery */
  sign(362, 25, 'STRIKE THE GLASS: THE SAND-FALL FLOWS UP. STEP IN AND RIDE IT.');
  glass('works2', 364, 25, 7); sea(368, 369, 40); dfall('works2', 368, 369, 15, 39);
  isle('house', 370, 377, 15, 26);                                                 /* THE UPPER GALLERY (row 15) */
  /* BEAT THREE - THE SAND-BOUND AND THE TILTING DUNE: one glass holds both. Resting, the sand holds the sand-bound (a blow glances off: THE SAND HOLDS IT) and the
     dune by the gallery rises WEST - a wall from here. Struck, the sand-bound is buried to the chest (stuck, every blow whole) and the dune tilts the other way: a
     ramp up to the high kiln */
  sign(370, 14, 'THE SAND HOLDS THE SAND-BOUND. TURN THE GLASS AND IT IS BURIED.');
  glass('works3', 372, 14, 9); sandBound(376, 14, 'works3', 'worksBound');
  tilt('works3', 378, 382, 15, 40);
  isle('house', 383, 388, 10, 31);                                                 /* THE HIGH KILN (row 10) */
  /* THE EXAM - THE RELAY: the high kiln's glass raises two roofs down to a chimney stub; ITS glass raises the last roof over the pit and buries the sand-bound
     waiting on the floor; a slinger on the balcony over the floor throws at the relay. Then a shrine */
  sign(383, 9, 'THE RELAY: EACH GLASS RAISES THE WAY TO THE NEXT.');
  glass('works4', 385, 9, 8); sea(389, 397, 40); riser('works4', 390, 392, 13, 2, 'house'); riser('works4', 394, 396, 17, 2, 'dome');
  isle('minaret', 398, 400, 21, 20); glass('works5', 399, 20, 6);
  sea(401, 403, 40); riser('works5', 401, 403, 26, 2, 'house');
  ground(404, 408, CO); plat('balcony', 406, 408, 28); slinger(407, 27, 'worksSling', { face: -1 });
  sandBound(405, CO - 1, 'works5', 'worksFloor');
  ent('check', 408, CO - 1);                                                        /* THE GLASS WORKS' SHRINE, after its exam (A10b: one a section) */
  ground(409, 412, LH); roof(409, 412, 27);                                        /* (the corridor's end drops to the sluice's door) */

  // ================= 5. THE SAND-FALL (409-467): SET PIECE (NEW) - the sluice hall: swing the fall onto the wall, let it pile, swing it back, climb to the arch =================
  /* the hall (413-451), floor row 42; the way on is THE HIGH ARCH in its east wall (rows 31-33, its sill row 34 - eight rows over the floor: no jump reaches it).
     A crack in the roof over 438 pours THE SAND-FALL; its CHUTE (L.chutes 'sluice') lands it on THE GRATE (424-426: the sand runs away) or by THE WALL (449-451:
     it HEAPS, two rows to a step, up to the arch's sill). In the fall you are beaten down - so swing it in, let it pile, swing it back off the heap, and climb */
  ground(413, 451, SL); roof(413, 452, 24); block(452, 452, 25, 30); ground(452, 452, 34);
  interiors.push([413, 451, 25, 41, 'bcSluice']);
  decor.push({ kind: 'grate', x0: 424, x1: 426, y: SL }, { kind: 'arch', x0: 451, x1: 454, y0: 28, y1: 33 }); lamp(453, 29);
  sign(414, SL - 1, 'THE CHUTE LEVER SWINGS THE SAND-FALL: WHERE IT LANDS, THE SAND PILES UP.');
  ent('sandchute', 417, SL - 1, { chute: 'sluice' }); ent('sandchute', 438, SL - 1, { chute: 'sluice' });
  plat('balcony', 416, 420, 38); gear(418, 37);                                    /* GEAR FOUR, on the sluice keeper's balcony */
  plat('pipe', 427, 435, 39);
  drowned(422, SL - 1, 'sluiceDrift'); scorpion(432, SL - 1, 'sluiceVermin');
  construct(447, SL - 1, 'sluiceFloor');                                           /* a construct where the heap rises: the fall buries it to the gears (JAMMED) */
  ground(453, 467, 34); roof(453, 467, 29); plat('pipe', 458, 464, 31);           /* THE ARCH's corridor */
  slinger(456, 33, 'archSling', { face: -1 });                                     /* a slinger in the arch: he throws down into the hall while you work the chute */

  // ================= 6. THE DROWNED QUARTER (468-584): SET PIECE - THE GREAT SAND-GATE (REQUIRED); the foundry yard =================
  ground(468, 482, QS); roof(468, 539, 20);
  sign(471, QS - 1, 'THE GREAT SAND-GATE: E TURNS THE WHEEL. IT DRAINS THE WHOLE QUARTER.');
  ent('sandwheel', WHEEL.x, WHEEL.row - DY, { room: 'great' }); plat('balcony', 470, 474, 33); lamp(477, 30, 'brazier');
  /* the quarter: the old street at row 44, under twenty rows of sand on a fresh load (L.rooms 'great'); its east door (rows 40-43) is the only way on */
  ground(483, 539, LO); block(539, 539, 21, 39);
  interiors.push([483, 538, 21, 43, 'bcQuarter']);
  /* its ruins: houses, a tower, balconies - footing at three heights once the sand is gone */
  solidPlat('house', 492, 495, 41, 43); plat('balcony', 496, 500, 38); solidPlat('house', 502, 504, 35, 43); plat('balcony', 505, 509, 32); gear(507, 31);   /* GEAR FIVE, up the ruined houses' balconies */
  solidPlat('house', 516, 519, 41, 43); plat('balcony', 520, 524, 38); solidPlat('house', 526, 529, 35, 43); solidPlat('minaret', 532, 534, 33, 43); plat('beam', 530, 531, 35); plat('beam', 530, 531, 39);   /* (a fallen beam over the well between the house and the tower, and a step in it) */
  decor.push({ kind: 'greatgate', x0: 510, x1: 514, y: LO }); plat('pipe', 510, 514, 40); plat('beam', 491, 495, 37); plat('beam', 515, 519, 37);   /* the great gate's housing: a step over its grille */
  /* the quarter's dormant watch and its drowned: under the sand on a fresh load - the hands stand them up when the sand has gone off them (sandWait) */
  construct(512, LO - 1, 'quarterWatch', { sandWait: 'great', dormant: true }); construct(536, LO - 1, 'quarterWatch2', { sandWait: 'great' });
  drowned(488, LO - 1, 'quarterDrift', { sandWait: 'great' }); drowned(522, LO - 1, 'quarterDrift2', { sandWait: 'great' }); slinger(527, 34, 'quarterSling', { sandWait: 'great' });
  /* THE FOUNDRY YARD (540-584): the old street east of the quarter, brass pipes overhead */
  ground(540, 584, LO); roof(540, 584, 32);
  plat('pipe', 541, 545, 41); plat('pipe', 547, 551, 38); plat('pipe', 559, 563, 41); plat('pipe', 565, 569, 38); plat('balcony', 575, 579, 41);
  drift(562, 564, LO);                                                             /* a drift in the foundry yard, by the elite */
  construct(556, LO - 1, 'foundry', { elite: true }); slinger(561, 40, 'foundrySling');   /* THE QUARTER'S EXAM: an ELITE construct with the drift at his back (held in it, you are his mark) and a slinger over it */
  /* THE FOUNDRY'S FLOOR-GATE (the TEACH of the trap hall): a small OPEN floor-gate in the yard's street (570-572): a drop of three rows onto the foundry's floor -
     a quarter of you and back to the lip (src/buried-city-hands.js dropBack). Its lever on the west lip shuts it and the sand bridges it */
  air(570, 572, LO, LO + 2);
  ent('sandlever', 568, LO - 1, { room: 'yard' });
  sign(565, LO - 1, 'AN OPEN FLOOR-GATE IS A DROP. SHUT IT AND THE SAND BRIDGES IT.');
  ent('check', 578, LO - 1);                                                        /* CHECKPOINT THREE, after the quarter's exam and the floor-gate's teach (tools/checkpoint-gaps: 200 route tiles at most - the sand-fall's climb and the quarter's ruins fill them) */

  // ================= 7. THE THRONE STREET (585-701): THE EXAM - ride the shaft through the sun; feed the trap hall under a squad; the throne's warden =================
  /* THE CLOCK SHAFT (RIDE IT UP): the old street's end is a shaft; its way on is high in its east wall (rows 29-31); the roof over it is holed (591-592): ride
     the sand up in the light and the sun burns you - stand clear of the shaft of it */
  ground(585, 597, LO); block(585, 585, 21, 40); roof(585, 598, 20); block(598, 598, 21, 28); ground(598, 598, TH);
  shaft(591, 592, 20);
  interiors.push([586, 597, 21, 43, 'bcShaft']);
  ent('sandlever', 588, LO - 1, { room: 'shaft' });
  plat('beam', 593, 597, 28); slinger(595, 27, 'shaftSling', { face: -1 });       /* a slinger on a hung beam over the full sand */
  drowned(591, LO - 1, 'shaftDrift');                                              /* a drowned in the shaft's floor: it rides the sand up with you */
  /* THE THRONE STREET (599-701, row 32) */
  ground(599, 617, TH); roof(599, 701, 20);
  plat('balcony', 603, 607, 29);
  /* THE TRAP HALL (THE EXAM, REQUIRED): its floor-gate is OPEN - a drop to the end - and the roof's SAND-FALL lands on the lip, where a construct stands held in it.
     SHUT THE FLOOR-GATE (616) AND SWING THE FALL INTO THE HALL (610): only then does it fill, and you walk over. Swing it first and the sand falls through into the
     dark; and the moment it leaves the lip, the construct it held is free */
  air(618, 631, TH, H - 1); interiors.push([618, 631, TH, 45, 'bcTrap']);
  sign(608, TH - 1, 'THE CHUTE LEVER SWINGS THE SAND-FALL INTO THE HALL.');
  sign(615, TH - 1, 'THE TRAP HALL\'S FLOOR-GATE IS OPEN: A FALL HERE IS THE END.');
  ent('sandchute', 610, TH - 1, { chute: 'trapfall' });
  ent('sandlever', 616, TH - 1, { room: 'trap' }); ent('sandlever', 634, TH - 1, { room: 'trap' });
  construct(613, TH - 1, 'trapLip', { face: 1 }); drowned(615, TH - 1, 'trapLip');   /* THE EXAM's construct on the lip, in the fall (JAMMED while it holds him), and a drowned on the lip's edge: a heavy blow throws him OFF THE EDGE */
  ground(632, 701, TH); plat('balcony', 637, 641, 29); slinger(639, 28, 'trapSling', { face: -1 });   /* across the hall: a slinger on a balcony */
  /* THE KING'S COURT: his kneeling courtiers (the drowned of his court, stone now), his statues, and THE THRONE'S WARDEN */
  decor.push({ kind: 'courtiers', x0: 635, x1: 651, y: TH - 1 }, { kind: 'kingstatue', x: 665, y: TH - 1, h: 9 }, { kind: 'kingstatue', x: 684, y: TH - 1, h: 9 });
  drift(647, 649, TH); plat('balcony', 648, 652, 29);
  construct(654, TH - 1, 'throneGuard', { elite: true, gate: 661 }); scorpion(658, TH - 1, 'throneGuard');
  plat('balcony', 655, 659, 26); slinger(657, 25, 'throneGuardSling');             /* THE THRONE'S WARDEN (an ELITE construct: his gate at 661 shuts the street until he falls - the drift at your back), a scorpion, a slinger over them */
  /* THE CLOCKWORK VAULT: a low cellar under the street, WEST of a hatch in it (drop in; its door opens on five gears). The cellar is two rows deep and ends at
     the hatch's east edge, and a one-way step stands under the hatch: a hero who drops in by mistake lands on it, two rows under the street */
  air(678, 679, TH, TH); air(672, 679, TH + 1, TH + 2); plat('lintel', 678, 679, TH + 2);   /* the hatch, the cellar (floor row 35), the step under the hatch */
  block(675, 675, TH + 1, TH + 2); interiors.push([676, 679, TH + 1, TH + 2, 'bcVaultHall'], [672, 674, TH + 1, TH + 2, 'bcVault']);
  vaultDoors.push({ id: 'clockwork', x: 675, y0: TH + 1, y1: TH + 2, gears: 5 }); ent('gearvault', 675, TH + 2, { id: 'clockwork' }); ent('silver', 673, TH + 2);
  sign(682, TH - 1, 'THE CLOCKWORK VAULT, DOWN THE HATCH. FIVE GEARS OPEN ITS DOOR.');
  rotten(686, 690, 29); plat('balcony', 695, 699, 29);                             /* a ROTTEN balcony and a sound one by the throne door */
  drowned(688, TH - 1, 'courtLast');                                               /* the last of his court, up out of the sand at the throne door */
  ent('check', 693, TH - 1);                                                        /* CHECKPOINT FOUR, before the king (after the exam) */
  lamp(697, 26, 'brazier');
  decor.push({ kind: 'relief', x0: 688, x1: 700, y: 26 });                         /* (the next road) THE SEALED PYRAMID carved over the throne door: a tomb with a scarab on its seal */

  // ================= 8. THE ROOFTOPS (702-821, claude/buriedcity3): OUTSIDE - out through a breach in the sand roof onto the open desert city: its rooftops,
  //    domes and minaret stubs stand up out of THE SAND SEA under THE SUN (A13: the drain; shade under the awnings). REMIX: the sand-fall that flows up, the
  //    chain of two glasses; EXAM: the last glass sinks the one roof that stands while it raises the rest, over sand that is the end; then down through a
  //    COURTYARD under a collapsed dome to the throne room's door, its ELITE in the sun. (A14: the level's platforming section; every hero, base movement)
  /* THE BREACH (702-709): the throne street's roof has fallen in at its end - a shaft up to the sky, ledges on its walls */
  block(701, 701, 21, 27);                                                         /* (the roof's broken edge over the street's mouth: the street goes on under it, rows 28-31) */
  ground(702, 709, TH); ground(710, 717, 14);                                      /* the breach's floor; THE DUNE's bank (the breach's east wall is its face) */
  plat('balcony', 706, 709, 29); plat('lintel', 702, 706, 26); plat('balcony', 705, 709, 23); plat('lintel', 702, 706, 20); plat('balcony', 705, 709, 17);
  decor.push({ kind: 'awning', x0: 705, x1: 709, y: 20 }); shadeBox(702, 709, 21, TH - 1);   /* (the roof's torn edge shades the breach's foot) */
  sign(698, TH - 1, 'THE ROOF HAS FALLEN IN. UP AND OUT, UNDER THE SUN.');
  /* THE DUNE TOPS: the bank (710-717), THE SAND SEA's first trough (718-734): a buried house's roof and a dome stand out of it; a SAND-FALL spills off the
     high dune's lip (732-733) - STRIKE THE GLASS ON THE DOME AND IT FLOWS UP (REMIX: ride it to the high dune, eight rows up). Idle, it beats you down into the sea */
  sign(711, 13, 'THE SAND SEA SWALLOWS WHAT FALLS IN. KEEP TO THE ROOFS.');
  decor.push({ kind: 'awning', x0: 713, x1: 716, y: 10 }); shadeBox(713, 716, 11, 13);
  sea(718, 734, 16); isle('house', 721, 725, 14, 2); isle('dome', 727, 730, 14, 2); decor.push({ kind: 'dome', x0: 727, x1: 730, y: 14 });
  glass('fall', 728, 13, 8); dfall('fall', 732, 733, 6, 15);
  sign(723, 13, 'STRIKE THE HOURGLASS: THE SAND-FALL FLOWS UP. RIDE IT.');
  /* THE HIGH DUNE (734-752): shade under a stall's cloth; then THE CHAIN (753-784, REMIX): the high dune's glass raises three roofs down to a minaret stub that
     stands in the sea; its own glass raises the last two to the far bank. A slinger on the stub throws while you cross (a fight during the rule) */
  ground(734, 752, 6); decor.push({ kind: 'awning', x0: 738, x1: 742, y: 2 }); shadeBox(738, 742, 3, 5);
  sign(744, 5, 'TWO GLASSES: THE FIRST RAISES THE WAY TO THE SECOND.');
  glass('chain1', 750, 5, 8); sea(753, 784, 16);
  riser('chain1', 754, 756, 8, 2, 'house'); riser('chain1', 759, 761, 10, 2, 'house'); riser('chain1', 764, 766, 11, 2, 'dome');
  isle('minaret', 769, 770, 11, 5); glass('chain2', 769, 10, 7);
  riser('chain2', 773, 775, 11, 2, 'house'); riser('chain2', 778, 780, 11, 2, 'house');
  slinger(785, 11, 'roofSling', { face: -1 });                                     /* (on the far bank, throwing back across the chain) */
  /* THE FAR BANK (783-794) and THE EXAM (795-808): the last glass RAISES three roofs and SINKS the one that stands (798-800: the sand runs the other way) -
     a jump too far without it, and the sand under them is THE END (taught twice before: a bite and back). Then the courtyard */
  ground(783, 794, 12); decor.push({ kind: 'awning', x0: 784, x1: 788, y: 8 }); shadeBox(784, 788, 9, 11);
  sign(786, 11, 'THE LAST GLASS SINKS THE ROOF THAT STANDS - AND RAISES THE REST.');
  glass('exam', 791, 11, 6); sea(795, 808, 16, true);
  sinker('exam', 798, 799, 12, 2, 'house');
  riser('exam', 795, 797, 13, 2, 'house'); riser('exam', 801, 803, 12, 2, 'dome'); riser('exam', 806, 807, 11, 2, 'house');
  /* THE COURTYARD (809-821) under a collapsed dome: its rim, its ribs down to the floor (row 32), the throne room's door in its east wall. THE EXAM BEFORE THE
     THRONE (claude/buriedcity4, brief 9) - one stretch: THE COURTYARD'S ELITE in the sun with a SAND-BOUND (its glass by the old street's door: struck, the
     sand-bound is buried and the elite fights alone), then THE ANTECHAMBER's run of TIMED SAND PLATFORMS over the sand (the King's own trick, foreshadowed), and the
     shrine after. Shade only under the dome's broken shell */
  ground(809, 810, 10); ground(811, 820, TH);
  plat('lintel', 812, 814, 15); plat('balcony', 817, 819, 19); plat('lintel', 812, 814, 23); plat('balcony', 817, 819, 27);
  decor.push({ kind: 'shell', x0: 809, x1: 821, y: 10 }); shadeBox(811, 813, 25, TH - 1);
  construct(815, TH - 1, 'courtyard', { elite: true }); slinger(818, 26, 'courtyardSling', { face: -1 });
  glass('court', 812, TH - 1, 8); sandBound(819, TH - 1, 'court', 'courtyardBound');
  sign(811, TH - 1, 'THE SAND HOLDS THE SAND-BOUND: TURN THE GLASS.');
  /* THE OLD STREET UNDER THE DUNES (brief 10, the LOOP BACK TO A SHRINE): the throne street runs on under the rooftops (rows 28-31, 710-810) to the courtyard - sealed
     at the courtyard end by a sand-gate that only opens FROM THE COURTYARD (E). Opened once, it stays open: a death past the rooftops walks back from the fourth
     shrine (693) under them in a few seconds. Under THE SAND SEA's troughs its floor (bottom 26) is the street's vault: the sea's bones are stakes (the reach model's
     floor of it - nothing stands there) */
  for (const [x0, x1] of [[718, 733], [753, 782], [795, 808]]) { ground(x0, x1, 27); for (let x = x0; x <= x1; x++) set(x, 26, T.SPIKE); }
  for (const s of seas) if (s.x0 >= 702) s.bottom = 26;
  air(710, 810, 28, TH - 1); interiors.push([710, 810, 28, TH - 1, 'bcUnder']);
  block(810, 810, 28, TH - 1);                                                      /* the sand-gate at the courtyard end (the hands open it: L.loopDoor) */
  sign(712, TH - 1, 'THE OLD STREET RUNS ON UNDER THE DUNES. ITS GATE IS SHUT FROM THE FAR SIDE.');
  lamp(760, 29); lamp(800, 29);
  /* THE ANTECHAMBER (822-844, claude/buriedcity4 - NEW): under the throne room's sand roof, a hall of sand with no floor: its glass raises four slabs of sand, each
     crumbling on its own timer (drawn over it), the last one latest - cross before they go. Under them THE SAND SEA (a bite, and back to the glass's floor). The shrine
     after it is the last before the king */
  block(821, 821, 10, 26); roof(822, 843, 21);                                     /* (the courtyard's east wall over the door; the hall's roof) */
  ground(822, 825, TH); sea(826, 838, TH); ground(839, 843, TH); interiors.push([822, 843, 22, TH - 1, 'bcAnte']);
  sign(822, TH - 1, 'STRIKE THE GLASS: THE SAND RISES. EACH SLAB CRUMBLES ON ITS TIMER.');
  glass('ante', 824, TH - 1, 7);
  tplat('ante', 827, 828, 31, 3.2); tplat('ante', 830, 831, 30, 4.2); tplat('ante', 833, 834, 31, 5.2); tplat('ante', 836, 837, 30, 6.2);
  decor.push({ kind: 'mural', x0: 840, x1: 843, y: 25 });                          /* (B8: the art lane draws HIM raising slabs of sand toward himself - foreshadowing his fight) */
  lamp(841, 24, 'brazier');
  ent('check', 842, TH - 1);                                                        /* CHECKPOINT FIVE, past the exam before the throne, at the throne room's door */

  // ================= THE HOURGLASS KING's THRONE ROOM (src/hourglass-king.js), at the foot of the Hourglass Tower =================
  const AX = 845;
  const stage = stageHourglassKing({ set: set0, block: block0, ent: ent0, air: (x0, x1, y0, y1) => air(x0, x1, y0 - DY, y1 - DY) }, T, TS, AX, TH + DY);   /* (his stage is laid in GRID rows: its arena is px) */
  ground(AX, AX + HK_STAGE.W - 1, TH);
  block(AX + HK_STAGE.W, W - 1, -DY, H - 1 - DY);
  stage.carve();
  for (const l of HK_STAGE.ledges) structures.push({ kind: 'chains', x0: AX + l.x0, x1: AX + l.x1, top: TH - 19, floor: TH - l.dy });   /* his two ledges hang on chains from the throne room's roof (the art pass draws them) */
  block(AX - 1, AX + HK_STAGE.W, 2, TH - 19);                                         /* the city's sand over the throne room's roof (its roof is not a slab in the air) */
  ent('gate', AX + HK_STAGE.W - 2, TH - 1);

  /* THE SAND'S BOXES for the reach model (src/reachcore.js, L.buriedcity): FILL-TO-CROSS rooms count as full, RIDE rooms (and the sinking street) as a stair of
     rungs three rows apart, THE SAND-FALL's heap as built up (its rungs). The grid itself is every room DRAINED and every heap flat (the hands write the sand in
     on load): nothing spawns inside sand, and the tools see the street */
  const sandSolid = ROOMS.filter(r => r.need).map(r => [r.x0, r.x1, r.floor - r.full, r.floor - 1]);
  for (const c of CHUTES) for (const t of Object.values(c.to)) if (t.kind === 'mound') for (const [j, x0, x1] of t.rungs) sandSolid.push([x0, x1, t.floor - j, t.floor - j]);
  const sandRungs = ROOMS.filter(r => r.use === 'ride' || r.use === 'sink').map(r => [r.x0, r.x1, r.floor - r.full, r.floor - 1]);
  /* THE FLIP for the reach model (claude/buriedcity3): a glass is struck where it stands (every hero has a blow, and E turns it too) - so its RISERS count as risen,
     its BANKS as run out (the grid as built has them so: the hands write the bank's sand in at load) and a sand-fall that flows UP as a stair of rungs (its top too) */
  for (const r of risers) if (!r.sinks) sandSolid.push([r.x0, r.x1, r.top + DY, r.top + r.rows - 1 + DY]);
  for (const f of dfalls) sandRungs.push([f.x0, f.x1, f.top + DY, f.bottom + DY]);
  for (const p of tplats) sandSolid.push([p.x0, p.x1, p.y + DY, p.y + DY]);   /* (claude/buriedcity4) THE TIMED SAND PLATFORMS count as risen (their glass is struck where it stands); THE TILTING DUNE is laid the way the route climbs it */
  /* THE LAID STONE: every column of the city from the first row under its sand roof down (a run of columns with the same roof is one rectangle) */
  /* THE DATA ROWS TO THE GRID'S (+DY) */
  for (const d of decor) for (const k of ['y', 'y0', 'y1']) if (typeof d[k] === 'number') d[k] += DY;
  for (const q of quicksand) q.y += DY * TS; for (const s of shade) { s[2] += DY * TS; s[3] += DY * TS; } for (const c of crumbles) c.row += DY;
  for (const z of structures) { z.top += DY; z.floor += DY; } for (const p of plats) { p.y += DY; if (p.y1 !== undefined) p.y1 += DY; } for (const lp of lamps) lp.y += DY;
  for (const it of interiors) { it[2] += DY; it[3] += DY; } for (const v of vaultDoors) { v.y0 += DY; v.y1 += DY; }
  for (const q of glasses) q.y += DY; for (const r of risers) r.top += DY; for (const b of banks) { b.y0 += DY; b.y1 += DY; } for (const f of dfalls) { f.top += DY; f.bottom += DY; } for (const q of seas) { q.row += DY; if (q.bottom !== undefined) q.bottom += DY; } for (const t of tilts) { t.lo += DY; t.floor += DY; } for (const p of tplats) p.y += DY;
  const masonry = []; { const roofEnd = x => { let y = 0; while (y < H && L.grid[y * W + x] === T.AIR) y++; while (y < H && L.grid[y * W + x] !== T.AIR) y++; return y; };   /* (claude/buriedcity3: past the open sky over a column, the first air under its roof - the dune over the throne room has sky over it now) */
    for (let x = 38; x < W; ) { if (x >= OUT.x0 && x <= OUT.x1) { x = OUT.x1 + 1; continue; } const y0 = roofEnd(x); let x1 = x; while (x1 + 1 < W && !(x1 + 1 >= OUT.x0 && x1 + 1 <= OUT.x1) && roofEnd(x1 + 1) === y0) x1++; if (y0 < H) masonry.push([x, x1, y0, H - 1]); x = x1 + 1; } }
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
    foeHit: { sanddrowned: 5.4, sandslinger: 2.3, brassscorpion: 4.8, sandbound: 5.4 },   /* (claude/buriedcity2: the L40 walker arrived 73-97% - drowned 4.6 -> 5.4, slinger 1.8 -> 2.3, scorpion 4.2 -> 4.8) */
    foeHp: { sanddrowned: 3.2, sandslinger: 2.2, brassscorpion: 3.0, sandbound: 3.2 },   /* (claude/buriedcity4: THE SAND-BOUND is the drowned's weight; the sand's 0.4 is its armour) */
    alarms: ROOMS.map(r => ({ x0: r.x0, x1: r.x1 })).concat(CHUTES.flatMap(c => Object.values(c.to).map(t => ({ x0: t.x0 - 4, x1: t.x1 + 4 })))),   /* THE RULE'S STATE for tools/rule-state.mjs: the sand rooms and the falls are where the rule is live */
    sun: SUN.map(z => ({ ...z })), shade, shadeArt: shade,   /* THE DESERT'S SUN on the dunes and in the shafts only (the city is under its roof): src/buried-city-hands.js sunAt */
    loopDoor: { x: 810, y0: 28 + DY, y1: TH - 1 + DY, lever: [812, TH - 1 + DY] },   /* (claude/buriedcity4) THE OLD STREET's sand-gate: opened from the courtyard (E), it stays open (brief 10, the loop back to the fourth shrine) */
    glasses, risers, banks, dfalls, seas, tilts, tplats, outside: [{ ...OUT }], outMasonry: [[702, 709, 0, H - 1], [811, 820, 0, H - 1]],   /* THE FLIP (claude/buriedcity3): the hourglasses and what each turns; THE SAND SEA; THE ROOFTOPS are OUTSIDE (the backdrop's sky: src/redraw/buried_city_backdrop.js) */
    noSkyRays: true,   /* (the sky's rays are the dunes' and the shafts' only: src/redraw/buried_city_backdrop.js draws the shafts' light) */
    quest: { n: 5, item: 'gear', name: 'GEARS', done: 'FIVE GEARS: THE CLOCKWORK VAULT OPENS', thanks: 'THE CLOCKWORK VAULT OPENS' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,   /* (A10b: a shrine a section - 166, 329, 578, 693, and 820 after THE ROOFTOPS' exam, before the king) */
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
