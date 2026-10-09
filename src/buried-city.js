// src/buried-city.js - THE BURIED CITY, desert act, main road past THE BANDIT KSAR (claude/buriedcity, the OPUS GREYBOX, 2026-10-08: geometry, the sand rule,
// the encounters, the wiring; greybox art only). From the draft (src/draft/buried-city.js) and Daniel's confirmed desert-arc concept (scratch/desert-arc-concept-
// 2026-10-01.md, docs/briefs/buried-city.md) brought to today's rules: one rule-verb, teach -> test -> remix -> exam, one required use, ONE new foe (THE CLOCKWORK
// CONSTRUCT, src/construct.js), the rest reskins, gears -> a vault that pays SILVER (no relic), no mini (the concept cut THE SAND WARDEN), no living goblin
// (the road is past the Goblin Queen: the draft's sand-goblin slingers are SAND-FOLK SLINGERS here). Main road: ksar > BURIED CITY > (the Sealed Pyramid, not
// built yet: it will need 'buriedcity').
//
// THE RULE: THE CITY'S ROOMS FILL WITH SAND: PULL A SAND-GATE AND A ROOM DRAINS; SHUT IT AND THE SAND RISES - AND CARRIES YOU.
// A SAND ROOM (L.rooms) has a floor-gate and holes in its roof the city's sand pours through. Its SAND-GATE LEVER (E, src/buried-city-hands.js) works the gate:
// OPEN, the room drains (its sand runs out through the floor); SHUT, the pour fills it a row at a time. Sand is footing: it RISES UNDER YOU AND CARRIES YOU UP
// (and a room full to its doorway SHUTS it). The state is drawn (A3): the sand body itself, the streams from the roof while it fills, the gate's slot running
// while it drains, and a SAND GAUGE on every lever (its level, and OPEN/SHUT). Four uses:
//   DRAIN TO PASS  a room full to the top of its doorway shuts the way: drain it (the teach room, THE UPPER BULB, THE DROWNED QUARTER's great gate)
//   RIDE IT UP     a room whose way on is high in its far wall: shut its gate from inside and the sand carries you up to it (THE GRANARY, THE CLOCK SHAFT)
//   FILL TO CROSS  a room over spikes or an open drop: shut its gate and walk over on the sand (THE SPIKE CELLAR; THE TRAP HALL in the exam, where the open
//                  floor-gate is a fall to the end)
//   RUN IT DOWN    THE HOURGLASS: the upper bulb's gate pours its sand INTO the lower bulb - one pull opens the way and fills the pit after it, and the
//                  constructs on the lower floor are carried up JAMMED (grit in their gears)
// THE GREAT SAND-GATE (set piece one, REQUIRED): a wheel turned three times drains the whole Drowned Quarter - the old street comes out from under it, and its
// door is the only way on. THE HOURGLASS (set piece two): the bulbs, read above.
//
// THE THEMED KEY: five brass GEARS (L.quest). With all five THE CLOCKWORK VAULT's door (the cellar by the throne-hall door) opens: a silver (no relic).
//
// SIX SECTIONS (columns; the city's street is row 34, the throne street's 30, the Drowned Quarter's old street 42):
//   0-89     THE SAND STAIR         TEACH    down off the dunes (the sun, the last of it) through the sinkhole into the city; THE FIRST SAND ROOM: full to its
//                                            doorway, its lever outside - pull it (failure is cheap: no foe in reach); the first drowned in the drifts
//   90-219   THE MARKET UNDER SAND  TEST     the market watch (a slinger over the stalls, brass scorpions under them); THE GRANARY (RIDE IT UP: its way on is high in
//                                            its east wall, a slinger on the shaft's ledge while you rise); THE UPPER STREET: the first CONSTRUCT
//   220-306  THE HOURGLASS HALLS    REMIX    THE SPIKE CELLAR (FILL TO CROSS, a slinger across it); THE HOURGLASS (RUN IT DOWN: the upper bulb into the lower, two
//                                            constructs jammed by it)
//   307-419  THE DROWNED QUARTER    SET PIECE THE GREAT SAND-GATE (REQUIRED): turn the wheel, the quarter drains, the old street and its dormant constructs come out
//   420-523  THE THRONE STREET      EXAM     THE CLOCK SHAFT (ride it with a slinger over you), THE TRAP HALL (an open floor-gate is a death; fill it under a
//                                            construct and a slinger), the last squad; THE CLOCKWORK VAULT's cellar
//   524-563  THE THRONE ROOM        BOSS     THE HOURGLASS KING (src/hourglass-king.js stageHourglassKing)
import { stageHourglassKing, HK_STAGE } from './hourglass-king.js';

export const BC = { W: 568, H: 46, base: 34, upper: 26, low: 42, throne: 30 };
export const SECTIONS = [['THE SAND STAIR', 0], ['THE MARKET UNDER THE SAND', 90], ['THE HOURGLASS HALLS', 220], ['THE DROWNED QUARTER', 307], ['THE THRONE STREET', 420], ['THE THRONE ROOM', 524]];
export const RULE = 'THE CITY\'S ROOMS FILL WITH SAND: PULL A SAND-GATE AND A ROOM DRAINS; SHUT IT AND THE SAND RISES - AND CARRIES YOU.';
/* each use's arc (tile columns) - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/buried-city.mjs */
export const ARCS = {
  drain: { teach: [47, 68], test: [244, 258], remix: [307, 373], exam: [420, 434], boss: [524, 563] },     /* the first room; the upper bulb; THE GREAT SAND-GATE (required); the shaft; the king's glass */
  ride: { teach: [118, 134], test: [421, 434] },                                                           /* THE GRANARY; THE CLOCK SHAFT */
  fill: { teach: [205, 228], remix: [259, 276], exam: [448, 466] },                                        /* THE SPIKE CELLAR; the lower bulb; THE TRAP HALL (required) */
};
/* the sand rooms: x0..x1 the interior, floor the surface row under the sand (the sand stands on rows floor-full .. floor-1), full its rows, init its state on a
   fresh load ('full' or 'empty'), levers [x, feet row, chain rows (a CHAIN up the wall: pulled anywhere on its length - the lever inside a room you may be
   standing on the sand of)], need (the route must cross it full: the reach model counts it full), pour (the roof feeds it while its gate is shut), into (its sand runs into that room when its gate is open:
   THE HOURGLASS), trap (its floor-gate is the floor: open, the room is a drop to the end), fill/drain rows a second, use (what the room asks of you) */
export const ROOMS = [
  { id: 'first', x0: 56, x1: 67, floor: 34, full: 5, init: 'full', levers: [[51, 33], [66, 33, 5]], pour: true, fill: 1.0, drain: 2.2, use: 'drain', door: [68, 31, 33] },
  { id: 'granary', x0: 119, x1: 132, floor: 34, full: 8, init: 'empty', levers: [[121, 33]], pour: true, fill: 1.1, drain: 2.4, use: 'ride', door: [133, 23, 25] },
  { id: 'cellar', x0: 212, x1: 227, floor: 40, full: 6, init: 'empty', levers: [[208, 33], [230, 33]], pour: true, fill: 1.3, drain: 2.0, use: 'fill', need: true, spikes: 39 },
  { id: 'upperbulb', x0: 248, x1: 257, floor: 30, full: 5, init: 'full', levers: [[245, 29], [255, 29, 5]], pour: true, fill: 0.9, drain: 1.0, use: 'drain', into: 'lowerbulb', door: [258, 27, 29] },
  { id: 'lowerbulb', x0: 260, x1: 275, floor: 40, full: 10, init: 'empty', levers: [], pour: false, fill: 2.0, drain: 2.0, use: 'fill' },
  { id: 'great', x0: 317, x1: 372, floor: 42, full: 18, init: 'full', levers: [], pour: false, fill: 0, drain: 3.0, use: 'drain', great: true, door: [373, 38, 41] },
  { id: 'shaft', x0: 421, x1: 432, floor: 42, full: 12, init: 'empty', levers: [[423, 41]], pour: true, fill: 1.2, drain: 2.4, use: 'ride', door: [433, 27, 29] },
  { id: 'trap', x0: 452, x1: 465, floor: 44, full: 14, init: 'empty', levers: [[449, 29], [468, 29]], pour: true, fill: 2.2, drain: 3.0, use: 'fill', need: true, trap: true },
];
export const WHEEL = { x: 313, row: 33, room: 'great', turns: 3 };

export function buildBuriedCity({ painter, T, TS }) {
  const { W, H, base: B, upper: U, low: LO, throne: TH } = BC;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const ledge = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const ground = (x0, x1, top) => block(x0, x1, top, H - 1);
  const roof = (x0, x1, bottom) => block(x0, x1, 0, bottom);
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ face: -1, squad }, o || {}));
  /* THE CAST (every one a proven machine under a skin but the construct; L.foeHit / L.foeHp weigh them, A9 + difficulty v2: fewer, weightier) */
  const construct = (x, y, squad, o) => foe('construct', x, y, squad, o);                                                                     /* THE CLOCKWORK CONSTRUCT: the one new AI (src/construct.js) */
  const drowned = (x, y, squad, o) => foe('ambusher', x, y, squad, Object.assign({ cnSkin: 'sanddrowned' }, o || {}));                      /* THE SAND-DROWNED: the caravan's ambusher (it rises out of the drift as you come) */
  const slinger = (x, y, squad, o) => foe('slinger', x, y, squad, Object.assign({ cnSkin: 'sandslinger' }, o || {}));                       /* THE SAND-FOLK SLINGER: the ranged one (the draft's sand-goblin, a man now) */
  const scorpion = (x, y, squad, o) => foe('scorpion', x, y, squad, Object.assign({ cnSkin: 'brassscorpion' }, o || {}));                   /* THE BRASS SCORPION: the city's clockwork vermin on the scorpion's machine */
  const gear = (x, y) => ent('stray', x, y, { kind: 'gear' });
  const decor = [], interiors = [], vaultDoors = [], shade = [], crumbles = [], quicksand = [];
  /* THE SAND EATS THE CITY (two of its kit's pieces, both the city's sand: level-quality's gadget count asks for them, and they are platforming the rule's sand
     makes sense of): A ROTTEN BALCONY (src/tower-collapse.js crumbles: stand on it and it counts three and gives way, and it is back four seconds later -
     never on the main route's only footing) and A DRIFT (src/quicksand.js: a one-row pit of loose sand on the street - it holds you; jump, and keep jumping) */
  const rotten = (x0, x1, y) => { ledge(x0, x1, y); crumbles.push({ x0, x1, row: y, rows: 1, count: 3 }); };
  const drift = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.AIR); quicksand.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: y * TS }); };
  const shadeBox = (x0, x1, y0, y1) => shade.push([x0 * TS, (x1 + 1) * TS, y0 * TS, (y1 + 1) * TS + 1]);

  // ================= 1. THE SAND STAIR (0-89): TEACH - the first sand room, its lever outside, nothing in reach of it =================
  ground(0, 24, 22);                                                               /* the dunes over the city (the last of the sun) */
  sign(3, 21, 'THE BURIED CITY. THE SAND POURS IN.');
  decor.push({ kind: 'spire', x: 8, y: 21, h: 9 }, { kind: 'spire', x: 20, y: 21, h: 6 }, { kind: 'awning', x0: 13, x1: 17, y: 17 });
  shadeBox(13, 17, 18, 21);                                                       /* a torn canopy on two spires' stumps: shade on the dunes */
  ground(25, 28, 24); ground(29, 32, 26); ground(33, 36, 28); ground(37, 40, 30); ground(41, 44, 32); ground(45, 89, B);   /* THE SINKHOLE STAIR down into the street */
  roof(34, 89, 21);                                                                /* the sand roof: past the sinkhole the city is under it */
  decor.push({ kind: 'sinkhole', x0: 25, x1: 33 });
  ledge(9, 12, 19);                                                                /* a spire's fallen drum on the dunes (a second height) */
  ledge(5, 8, 16); ent('silver', 6, 15);                                           /* A SILVER on the spire's broken top (off the route: up off the drum) */
  ledge(38, 41, 26);                                                               /* a broken lintel in the sinkhole's wall (a second height on the stair) */
  /* THE FIRST SAND ROOM (TEACH, safe): full to the top of its doorway; its lever stands outside it on the street */
  { const r = ROOMS[0]; roof(55, 68, 25); block(55, 55, 26, 30); block(68, 68, 26, 30); interiors.push([56, 67, 26, 33, 'bcRoom']); }
  sign(47, B - 1, 'THE ROOMS FILL WITH SAND. E PULLS A SAND-GATE: THE ROOM DRAINS.');
  ent('sandlever', 51, B - 1, { room: 'first' }); ent('sandlever', 66, B - 1, { room: 'first', chain: 5 });
  ledge(45, 49, 31);                                                               /* a balcony over the street by the first room */
  rotten(72, 76, 31); gear(74, 30);                                                /* GEAR ONE, on a ROTTEN balcony past the room (it gives way: cheap here, a drop to the street) */
  sign(78, B - 1, 'A DRIFT HOLDS YOU. JUMP, AND KEEP JUMPING.');
  drift(82, 84, B);                                                                /* THE FIRST DRIFT: the drowned rise either side of it */
  ledge(80, 84, 31); decor.push({ kind: 'house', x0: 78, x1: 86, y: 31 });
  drowned(81, B - 1, 'firstDrift'); drowned(86, B - 1, 'firstDrift');             /* THE FIRST DROWNED: up out of the drift past the room (the road's first fight, out of the teach room's reach) */

  // ================= 2. THE MARKET UNDER THE SAND (90-219): TEST - THE GRANARY's ride, the market watch, the first construct =================
  ground(90, 117, B); roof(90, 219, 17);                                          /* the market hall: a higher roof */
  for (const [x0, x1] of [[93, 96], [101, 104], [108, 111]]) { ledge(x0, x1, 31); decor.push({ kind: 'stall', x0, x1, y: 31 }); }   /* the stalls: their awnings are ledges */
  ledge(97, 100, 28); ledge(112, 116, 28);                                        /* balconies over the stalls */
  ledge(92, 95, 25);                                                               /* the high cornice (a perch off the balcony; its silver moved to the spire: the cap is three) */
  slinger(98, 27, 'marketWatchSling'); scorpion(103, B - 1, 'marketWatch'); scorpion(110, B - 1, 'marketWatch', { face: 1 });   /* THE MARKET WATCH: a slinger over the stalls, brass scorpions under them */
  slinger(114, 27, 'marketWatch2', { face: -1 });
  /* THE GRANARY (TEST, RIDE IT UP): the way on is HIGH in its east wall; inside, its lever shuts the gate and the pour carries you up */
  ground(118, 132, B); block(117, 118, 18, 30); block(133, 133, 18, 22); ground(133, 133, 26);   /* its floor and walls: the west door at the floor, the east door high (rows 23-25) */
  air(118, 118, 26, 28);                                                           /* (an ALCOVE in the west wall, open only to the room, half way up: a gear for a hero who catches the sand there) */
  gear(118, 28);
  interiors.push([119, 132, 18, 33, 'bcGranary']);
  sign(115, B - 1, 'THE WAY ON IS HIGH. SHUT THE GATE AND THE SAND CARRIES YOU UP.');
  ent('sandlever', 121, B - 1, { room: 'granary' });
  ledge(129, 132, 23); slinger(131, 22, 'granarySling', { face: -1 });            /* a slinger on the shaft's top ledge: he throws while you rise */
  /* THE UPPER STREET (134-175): the market's roofs; the first construct */
  ground(134, 175, U);
  ent('check', 145, U - 1);                                                        /* CHECKPOINT ONE, past the granary */
  ledge(136, 141, 23);                                                             /* a balcony over the checkpoint */
  ledge(152, 156, 23); slinger(154, 22, 'upperWatch', { face: -1 });
  drift(158, 160, U);                                                              /* a drift under the slinger's balcony: in it, you are his mark */
  construct(152, U - 1, 'firstConstruct');                                        /* THE FIRST CONSTRUCT, in the open: its poke, its sweep */
  sign(140, U - 1, 'THE CITY\'S CONSTRUCTS: SAND IN THEIR GEARS JAMS THEM.');
  ledge(162, 165, 23); decor.push({ kind: 'dome', x0: 160, x1: 168, y: 25 });
  ledge(164, 167, 20); ent('silver', 166, 19);                                     /* A SILVER on the dome's lantern, under the market roof (off the route: a climb off the balcony) */
  ledge(169, 173, 23);
  drowned(167, U - 1, 'upperDrift'); scorpion(171, U - 1, 'upperDrift');
  ground(176, 178, 28); ground(179, 181, 30); ground(182, 184, 32); ground(185, 211, B);   /* the steps back down to the street */
  ledge(188, 192, 31); ledge(194, 198, 28); ledge(203, 206, 31);                 /* balconies on the market's last houses */
  construct(193, B - 1, 'marketEnd'); slinger(196, 27, 'marketEndSling');              /* a construct under a slinger's balcony */

  // ================= 3. THE HOURGLASS HALLS (220-306): REMIX - fill to cross the spikes; run the upper bulb down into the lower =================
  roof(220, 306, 21);
  /* THE SPIKE CELLAR (FILL TO CROSS): a pit of stakes between two lips; its lever on each lip; a slinger across it */
  ground(212, 227, 40); for (let x = 212; x <= 227; x++) set(x, 39, T.SPIKE);       /* (rows 34-39 the pit, stakes on its floor; the floor is row 40) */
  interiors.push([212, 227, B, 39, 'bcCellar']);
  sign(205, B - 1, 'SAND COVERS SPIKES. SHUT THE GATE AND WAIT FOR THE FILL.');
  ent('sandlever', 208, B - 1, { room: 'cellar' }); ent('sandlever', 230, B - 1, { room: 'cellar' });
  ledge(232, 236, 29); slinger(234, 28, 'cellarSling', { face: -1 }); scorpion(232, B - 1, 'cellarLip');   /* across the cellar: a slinger over its far lip, a scorpion on it */
  ground(228, 238, B); ground(239, 240, 32); ground(241, 247, TH);                /* up to the halls' corridor (row 30) */
  roof(236, 247, 25);
  /* THE HOURGLASS: THE UPPER BULB (full, across the corridor) runs down into THE LOWER BULB (the pit after it) */
  ground(248, 258, TH); roof(247, 258, 22); block(247, 247, 23, 26); block(258, 258, 23, 26);   /* the upper bulb: doorways rows 27-29 both ends */
  interiors.push([248, 257, 23, 29, 'bcBulb']);
  sign(242, TH - 1, 'THE HOURGLASS: THE UPPER HALL DRAINS INTO THE LOWER.');
  ent('sandlever', 245, TH - 1, { room: 'upperbulb' }); ent('sandlever', 255, TH - 1, { room: 'upperbulb', chain: 5 });
  ground(259, 259, TH); air(260, 275, TH, 39); ground(260, 275, 40); ground(276, 300, TH);   /* the lower bulb: a pit sixteen wide, its floor row 40 */
  roof(259, 300, 24);
  interiors.push([260, 275, TH, 39, 'bcBulbLow']);
  ledge(270, 274, 37); ledge(272, 274, 34); ledge(273, 275, 31);                   /* the way up out of the lower bulb's floor (if you drop in before it fills) */
  construct(264, 39, 'bulbFloor', { face: 1 }); construct(269, 39, 'bulbFloor');  /* the lower bulb's watch: the sand that runs down carries them up JAMMED */
  gear(266, 39);                                                                    /* GEAR THREE, on the lower bulb's floor (among the constructs) */
  drowned(284, TH - 1, 'hallsEnd'); scorpion(289, TH - 1, 'hallsEnd'); construct(295, TH - 1, 'hallsEnd');   /* the halls' last squad */
  rotten(286, 291, 27);                                                            /* a ROTTEN balcony over the halls' corridor */
  ent('check', 280, TH - 1);                                                       /* CHECKPOINT TWO, past the hourglass */
  ground(301, 302, 32); ground(303, 316, B); ledge(303, 307, 31);                                       /* down to the street at the Drowned Quarter */

  // ================= 4. THE DROWNED QUARTER (307-419): SET PIECE - THE GREAT SAND-GATE (REQUIRED) =================
  roof(301, 380, 18);
  sign(308, B - 1, 'THE GREAT SAND-GATE: E TURNS THE WHEEL. IT DRAINS THE WHOLE QUARTER.');
  ent('sandwheel', WHEEL.x, WHEEL.row, { room: 'great' });
  /* the quarter: the old street at row 42, under eighteen rows of sand on a fresh load (L.rooms 'great'); its east door (rows 38-41) is the only way on */
  air(317, 372, 19, 41); ground(317, 373, LO); block(373, 373, 19, 37);
  interiors.push([317, 372, 19, 41, 'bcQuarter']);
  /* its ruins: houses, a tower, balconies - footing at three heights once the sand is gone */
  block(326, 329, 39, 41); ledge(330, 334, 36); block(336, 338, 33, 41); ledge(339, 343, 30); gear(341, 29);   /* GEAR FOUR, up the ruined houses' balconies */
  block(350, 353, 39, 41); ledge(354, 358, 36); block(360, 363, 33, 41); block(366, 368, 31, 41);   /* the broken tower (its silver moved to the dome's lantern: the cap is three, and the route climbs it) */
  decor.push({ kind: 'greatgate', x0: 344, x1: 348, y: LO }); ledge(344, 348, 38);   /* the great gate's housing: a step over its grille */
  /* the quarter's dormant watch and its drowned: under the sand on a fresh load - the hands stand them up when the sand has gone off them (sandWait) */
  construct(346, LO - 1, 'quarterWatch', { sandWait: 'great', dormant: true }); construct(370, LO - 1, 'quarterWatch2', { sandWait: 'great', dormant: true });
  drowned(322, LO - 1, 'quarterDrift', { sandWait: 'great' }); drowned(356, LO - 1, 'quarterDrift2', { sandWait: 'great' }); slinger(361, 32, 'quarterSling', { sandWait: 'great' });
  /* THE OLD STREET east of the quarter (374-419): the foundry's yard */
  ground(374, 419, LO); roof(374, 419, 30);
  ledge(374, 378, 39); ledge(380, 384, 39); ledge(386, 390, 36); ledge(392, 396, 39); ledge(398, 402, 36); ledge(404, 408, 39); ledge(412, 416, 39);
  drift(397, 399, LO);                                                             /* a drift in the foundry yard, under the slinger */
  construct(388, LO - 1, 'foundry'); slinger(394, 38, 'foundrySling'); drowned(400, LO - 1, 'foundry');   /* THE FOUNDRY's squad: a construct, a slinger over him, a drowned */
  ent('check', 410, LO - 1);                                                        /* CHECKPOINT THREE, after the quarter */

  // ================= 5. THE THRONE STREET (420-523): THE EXAM - ride the shaft under a slinger; fill the trap hall under a squad; deadly drops =================
  /* THE CLOCK SHAFT (RIDE IT UP, the exam's first lock): the old street's end is a shaft; its way on is high in its east wall (rows 27-29) */
  ground(420, 420, LO); block(420, 420, 19, 38); roof(420, 433, 18);              /* its west wall: the old street comes in at the floor (rows 39-41) */
  ground(421, 432, LO); ground(433, 433, TH); block(433, 433, 19, 26);            /* its east wall, the high door rows 27-29 */
  interiors.push([421, 432, 19, 41, 'bcShaft']);
  ent('sandlever', 423, LO - 1, { room: 'shaft' });
  ledge(428, 432, 27); slinger(430, 26, 'shaftSling', { face: -1 });             /* a slinger on the shaft's ledge over the full sand */
  drowned(427, LO - 1, 'shaftDrift');                                              /* a drowned in the shaft's floor: it rides the sand up with you */
  /* THE THRONE STREET (434-523, row 30) */
  ground(434, 451, TH); roof(434, 523, 20);
  ledge(437, 441, 27); gear(439, 26);                                              /* GEAR FIVE, on the street's first balcony */
  /* THE TRAP HALL (FILL TO CROSS, REQUIRED, the exam): its floor-gate is OPEN - a drop to the end - until you shut it; then the hall fills and you walk over */
  air(452, 465, TH, H - 1); interiors.push([452, 465, TH, 43, 'bcTrap']);
  sign(446, TH - 1, 'THE TRAP HALL\'S FLOOR-GATE IS OPEN: A FALL HERE IS THE END.');
  ent('sandlever', 449, TH - 1, { room: 'trap' }); ent('sandlever', 468, TH - 1, { room: 'trap' });
  construct(447, TH - 1, 'trapLip', { face: 1 }); drowned(443, TH - 1, 'trapLip');   /* THE EXAM's squad on the lip while the hall fills */
  ground(466, 523, TH); ledge(469, 473, 27); ledge(474, 477, 27); drift(476, 478, TH); slinger(471, 26, 'trapSling', { face: -1 });   /* across the hall: a slinger on a balcony */
  ledge(480, 484, 27); ledge(486, 490, 24);
  construct(486, TH - 1, 'throneGuard'); scorpion(492, TH - 1, 'throneGuard'); slinger(488, 23, 'throneGuardSling');   /* THE THRONE GUARD: a construct, a scorpion, a slinger over them */
  /* THE CLOCKWORK VAULT: a low cellar under the street, WEST of a hatch in it (drop in; its door opens on five gears). The cellar is two rows deep and ends at
     the hatch's east edge, and a one-way step stands under the hatch: a hero who drops in by mistake lands on it, two rows under the street */
  air(500, 501, TH, TH); air(494, 501, 31, 32); ledge(500, 501, 32);              /* the hatch, the cellar (floor row 33), the step under the hatch */
  block(497, 497, 31, 32); interiors.push([498, 501, 31, 32, 'bcVaultHall'], [494, 496, 31, 32, 'bcVault']);
  vaultDoors.push({ id: 'clockwork', x: 497, y0: 31, y1: 32, gears: 5 }); ent('gearvault', 497, 32, { id: 'clockwork' }); ent('silver', 495, 32);
  sign(504, TH - 1, 'THE CLOCKWORK VAULT, DOWN THE HATCH. FIVE GEARS OPEN ITS DOOR.');
  rotten(508, 512, 27); ledge(517, 521, 27);                                       /* a ROTTEN balcony and a sound one by the throne door */
  ent('check', 515, TH - 1);                                                        /* CHECKPOINT FOUR, before the king (after the exam) */

  // ================= THE HOURGLASS KING's THRONE ROOM (src/hourglass-king.js) =================
  const AX = 524;
  const stage = stageHourglassKing({ set, block, ent, air }, T, TS, AX, TH);
  ground(AX, AX + HK_STAGE.W - 1, TH);
  block(AX + HK_STAGE.W, W - 1, 0, H - 1);
  stage.carve();
  ent('gate', AX + HK_STAGE.W - 2, TH - 1);

  /* THE SAND'S BOXES for the reach model (src/reachcore.js, L.buriedcity): FILL-TO-CROSS rooms count as full, RIDE rooms as a stair of rungs - the verb done.
     The grid itself is every room DRAINED (the hands write the sand in on load): nothing spawns inside sand, and the tools see the street */
  const sandSolid = ROOMS.filter(r => r.need).map(r => [r.x0, r.x1, r.floor - r.full, r.floor - 1]);
  const sandRungs = ROOMS.filter(r => r.use === 'ride').map(r => [r.x0, r.x1, r.floor - r.full, r.floor - 1]);
  const START = { x: 3, y: 21 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: [], interiors,
    arena: stage.arena, gateAfterBoss: true,
    buriedcity: true, caravan: true,   /* caravan: the desert's hands in main.js (the bandits' and scorpions' machines, the sand and stone skins, THE SUN on the dunes - the city is under its roof) */
    rooms: ROOMS.map(r => ({ ...r, levers: r.levers.map(a => a.slice()) })), wheel: { ...WHEEL }, arenaLevers: stage.levers, vaultDoors, decor, sandSolid, sandRungs, crumbles, quicksand,
    /* THE CITY HITS HARD (difficulty v2: weight, not numbers of foes): a blow x this on top of the act's tier, by skin (main.js damagePlayer0 reads L.foeHit) */
    foeHit: { sanddrowned: 3.0, sandslinger: 1.0, brassscorpion: 2.6 },
    foeHp: { sanddrowned: 2.2, sandslinger: 1.6, brassscorpion: 2.2 },
    alarms: ROOMS.map(r => ({ x0: r.x0, x1: r.x1 })),   /* THE RULE'S STATE for tools/rule-state.mjs: the sand rooms are where the rule is live */
    sun: [{ x0: 0, x1: 34 }], shade, shadeArt: shade,   /* THE DESERT'S SUN on the dunes only (the city is under its roof). TODO(integrator): claude/ksar2's shared drain (src/drain.js, THE SUN v2) replaces src/sunstroke.js here when it lands */
    quest: { n: 5, item: 'gear', name: 'GEARS', done: 'FIVE GEARS: THE CLOCKWORK VAULT OPENS', thanks: 'THE CLOCKWORK VAULT OPENS' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,
    squadBands: [{ lo: 540, hi: 799, spots: 0, why: "THE HOURGLASS KING's THRONE ROOM: columns 524-563 are his arena - no squad stands in a boss arena" }],
    unlocks: [
      { kind: 'sandlever', opens: 'a sand room\'s floor-gate: open, the room drains (a full doorway opens); shut, it fills and carries you up (a high door, a crossing over spikes or a drop)', hud: 'THE GATE IS OPEN: THE ROOM DRAINS / THE GATE IS SHUT: THE SAND RISES' },
      { kind: 'sandwheel', opens: 'THE GREAT SAND-GATE: three turns drain the whole Drowned Quarter, and its old street\'s door is the only way on', hud: 'THE GREAT GATE OPENS A NOTCH' },
      { kind: 'stray', opens: 'THE CLOCKWORK VAULT by the throne-hall door once all five gears are carried (a silver)', hud: 'GEARS n/5 - THE CLOCKWORK VAULT WAITS (the quest counter)' },
    ],
    music: 'buriedcity',
    ambient: [{ x0: 0, x1: 99999, kind: 'buriedcity' }],   /* its own bed: src/audio.js SYNTH_BEDS.buriedcity (the sand's hiss, a far chime, the gears) */
    rockZones: [], masonry: [[34, 563, 0, H - 1]],   /* the city is laid sandstone: main.js paints it as coursed masonry, not the dunes' strata */
    palette: { set: 'desert', near: 'none', dress: 'none', noFg: true, noNear: true, haze: 'rgba(200,150,90,0.10)' },
    duskStart: -1, duskLen: 1,
  };
}
