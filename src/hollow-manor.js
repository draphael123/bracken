/* src/hollow-manor.js - THE HOLLOW MANOR (claude/hollowmanor, the OPUS GREYBOX; no own brief: scratch/lane-reports/hollowmanor-plan.md, from Daniel's 10-01 haunted-levels
   concept + his 10-15 placement; behind MANOR_SHIPS, src/mn-flag.js).
   Road: THE BURIAL CAVERNS (THE SILK UNDERCROFT when it lands: its exit is the cellar stair up into this house) -> THE HOLLOW MANOR -> THE WITCHLIGHT STAIR.
   A great empty house: grey stone, faded green damask, family portraits, armour on its racks; ONE accent, ghost-green (a possessed visor, a wisp, the Castellan).
   THE LANDMARK: the great hall's tower and its one lit high window over the roofs, the whole level (src/manor-hands.js drawBack). RULE: MN_RULE.
   THE VERBS (src/manor-hands.js runs them; every one DRAWN):
     TURN YOUR BACK  a SHIFTING PANEL (a wall's doorway, a stair, a bookcase) has two states. It swaps ONCE when no hero has faced it for MOVE.unwatched s (the boo's
                     `watched` rule: in front of the hero's face, within MOVE.range px) and must be watched again before it can swap back. The built grid holds the
                     open state B (what the reach and quality tools read); the hands set state A on a reset.
     KNOCK IT OUT    a POSSESSED SUIT (the `armour`, skin 'mnsuit') falls when its hold is gone: its GHOST (a wisp) flies to the nearest EMPTY SUIT (a rack, or the pile it
                     left) and stands it up again unless a blow LAYS IT TO REST in flight.
     LIGHT           a CANDELABRA (strike its stand: carry it, lit); WALL CANDLES lit or out (touch one with the flame: lit). SHADES will not enter a lit candle's light.
   SET PIECE: THE BLACKOUT (the long gallery): across its door the candles go out one by one (each flickers first), the shades come through the walls.
   COLLECTIBLES: three PORTRAIT KEYS open THE SEALED NURSERY (SILVER 2). No relic (Daniel 11-01).
   SECTIONS (Rootway recipe: TEACH -> TEST -> REMIX -> EXAM; tools/manor.mjs proves the required panels):
                          0-59  THE SERVANTS' HALL      TEACH  up the cellar stair; the first suit and its rack; THE MOVING DOOR (REQUIRED TURN); portrait one
                         60-139 THE PORTRAIT GALLERY    TEST   the poltergeist, portrait two, THE SHIFTING STAIR (REQUIRED TURN) up to the balcony; boos; the bookcase silver
                        140-209 THE LONG GALLERY        REMIX  THE BLACKOUT: the candelabra, the candles, the shades; a high and a low way; SHRINE ONE
                        210-273 THE NURSERY WING        EXAM   a moving door among suits, poltergeists and boos; portrait three; THE SEALED NURSERY (three keys)
                        274-287 THE ARMOURY DOOR               SHRINE TWO
                        288-339 THE GREAT HALL          BOSS   THE CASTELLAN'S GHOST (src/castellan.js)
   CHECKPOINTS (Daniel: fewer): START + 2 shrines. L.checkRun 200: the filler adds none. Placed wholly by hand (calm).
   FOES: POSSESSED SUITS are the existing armour in their own skin (cnSkin 'mnsuit'), SHADES the existing haunt in theirs ('mnshade'), both run by src/manor-hands.js;
   BOOS are master's own (they drift while your back is turned - the rule pays twice); THE POLTERGEIST ('poltergeist') is the level's one new foe. No goblins (act IV). */
import { MN_RULE, MN_SAY } from './mn-lines.js';

export const MN = {
  W: 340, H: 40,
  arena: { x0: 288, x1: 338, wallL: 287, wallR: 339, trigger: 291, floor: 30 },
  blackout: { x0: 146, x1: 209 },   /* THE LONG GALLERY: a hero past x0 puts the lights out; its candles are the ones inside */
  keysNeed: 3,
};
export const SECTIONS = [["THE SERVANTS' HALL", 0, 60], ['THE PORTRAIT GALLERY', 60, 140], ['THE LONG GALLERY', 140, 210], ['THE NURSERY WING', 210, 274], ['THE ARMOURY DOOR', 274, 288], ['THE GREAT HALL', 288, 340]];
/* THE REQUIRED TURNS (tools/manor.mjs: in state A the far side is out of reach, in state B in reach) and the nursery (out of reach until three keys) */
export const REQUIRED = { door: { panel: 'ps0', far: [34, 29] }, stair: { panel: 'ps1', far: [135, 29] }, wing: { panel: 'ps3', far: [238, 29] }, nursery: { far: [266, 20] } };

export function buildHollowManor({ painter, T, TS }) {
  const { W, H } = MN;
  const L = painter(W, H), { set, ent } = L;
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const ground = (x0, x1, top) => fill(x0, x1, top, H - 1, T.SOLID);
  const roof = (x0, x1, bottom) => fill(x0, x1, 0, bottom, T.SOLID);
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const shelves = [], panels = [], candles = [], stands = [], racks = [], portraits = [], doors = [];
  /* A SHELF: a one-way gallery, balcony or table (the frames: tools/solid-islands.mjs reads them as hullZones) */
  const shelf = (x0, x1, y) => { fill(x0, x1, y, y, T.ONEWAY); shelves.push([x0, x1, y]); };
  /* A SHIFTING PANEL: a = the cells SOLID in state A, b = the cells SOLID in state B (the other state's are AIR). The built grid holds STATE B, the open one (a moving door's
     floor doorway open and its high one shut, the stair standing, the bookcase swung): what the reach and quality tools read, and no wall floats. The eye is where it is watched from. */
  const panel = (kind, a, b, o = {}) => { const cells = a.concat(b), ex = cells.reduce((s, c) => s + c[0], 0) / cells.length, ey = cells.reduce((s, c) => s + c[1], 0) / cells.length;
    const p = { id: 'ps' + panels.length, kind, a, b, eye: { x: ex * TS + 8, y: ey * TS + 8 }, ...o }; panels.push(p);
    for (const [x, y] of a) set(x, y, T.AIR); for (const [x, y] of b) set(x, y, T.SOLID);
    ent('mnshift', Math.round(ex), Math.round(ey), { id: p.id, kind }); return p; };
  const col = (x, y0, y1) => { const c = []; for (let y = y0; y <= y1; y++) c.push([x, y]); return c; };
  const block = (x0, x1, y0, y1) => { const c = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) c.push([x, y]); return c; };
  /* THE MOVING DOOR: a wall at col x from the roof to the floor; state A its doorway is HIGH (rows hi..hi+2, out of reach), state B it is on the FLOOR */
  const movingDoor = (x, top, floor, hi) => { fill(x, x, top, floor - 1, T.SOLID); return panel('door', col(x, floor - 3, floor - 1), col(x, hi, hi + 2)); };
  const candle = (x, y, o = {}) => { const c = { id: 'cd' + candles.length, x: x * TS + 8, y: (y + 1) * TS, col: x, row: y, ...o }; candles.push(c); ent('mncandle', x, y, { id: c.id }); return c; };
  const stand = (x, y) => { const s = { id: 'cs' + stands.length, x: x * TS + 8, y: (y + 1) * TS, col: x, row: y }; stands.push(s); ent('mncandelabra', x, y, { id: s.id }); return s; };
  const rack = (x, y, o = {}) => { const r = { id: 'rk' + racks.length, x: x * TS + 8, y: (y + 1) * TS, col: x, row: y, ...o }; racks.push(r); ent('mnrack', x, y, { id: r.id }); return r; };
  const portrait = (x, y) => { const p = { id: 'pt' + portraits.length, x: x * TS + 8, y: y * TS + 8, col: x, row: y }; portraits.push(p); ent('mnportrait', x, y, { id: p.id }); return p; };
  const suit = (x, y, squad) => ent('armour', x, y, { squad, cnSkin: 'mnsuit' });
  const shade = (x, y, squad, perch) => ent('haunt', x, y, { squad, cnSkin: 'mnshade', ...(perch ? { perch: true } : {}) });   /* perch: stands above its squad on purpose (tools/sprinkle-cap.mjs; data only) */
  const polter = (x, y, squad) => ent('poltergeist', x, y, { squad });
  const boo = (x, y, squad, perch) => ent('boo', x, y, { squad, ...(perch ? { perch: true } : {}) });

  // ================= 1. THE SERVANTS' HALL (0-59): TEACH =================
  fill(0, 0, 0, H - 1, T.SOLID); roof(0, 59, 10);
  ground(0, 8, 34); sign(2, 33, MN_SAY.start);                                      /* the top of the cellar stair (the undercroft is below) */
  ground(9, 12, 32); ground(13, 59, 30); coins([10, 31], [11, 31]);
  sign(14, 29, MN_SAY.suit); rack(16, 29); suit(21, 29, 'hallSuit');                /* THE FIRST SUIT, and the empty one its ghost will run to */
  sign(18, 29, MN_SAY.wisp);
  sign(25, 29, MN_SAY.shift);
  const door0 = movingDoor(28, 11, 30, 15);                                         /* THE MOVING DOOR (REQUIRED TURN): face away from it, and its doorway comes down */
  portrait(32, 28); sign(30, 29, MN_SAY.portrait); coins([34, 29], [35, 29]); boo(42, 24, 'hallBoo');   /* the first boo: it drifts while your back is turned (the door taught you to turn it) */
  shelf(36, 40, 27); coins([37, 26], [39, 26]);                                      /* the servants' table */
  ground(46, 52, 28); suit(49, 27, 'daisSuit'); rack(51, 27); coins([47, 27]);
  shelf(53, 58, 25); coins([54, 24], [56, 24], [58, 24]);

  // ================= 2. THE PORTRAIT GALLERY (60-139): TEST =================
  roof(60, 139, 8);
  ground(60, 139, 30); sign(61, 29, MN_SAY.gallery);
  sign(66, 29, MN_SAY.poltergeist); polter(71, 24, 'galleryPolter');
  shelf(68, 74, 27); coins([70, 25], [72, 25]);
  portrait(77, 28); coins([78, 29], [79, 29]); suit(74, 29, 'portraitSuit'); rack(64, 29);
  sign(81, 29, MN_SAY.stair);
  /* THE SHIFTING STAIR (REQUIRED TURN): four steps up to the balcony appear only while nobody watches the place they stand */
  const stairCells = [].concat(block(84, 86, 28, 29), block(87, 89, 26, 29), block(90, 92, 24, 29), block(93, 95, 22, 29));
  const stair1 = panel('stair', [], stairCells, { stair: true });
  shelf(96, 131, 20);                                                                /* THE BALCONY: ten rows over the gallery floor */
  fill(120, 121, 21, 29, T.SOLID);                                                   /* the gallery's far wall under the balcony: the low floor ends here */
  boo(104, 26, 'galleryBoos'); boo(112, 25, 'galleryBoos', 1); sign(99, 19, MN_SAY.boo);
  suit(108, 29, 'lowSuit'); rack(115, 29); coins([111, 29], [113, 29], [117, 29], [118, 29]);   /* the low hall under the balcony: a suit, its rack, coins (a pocket that pays) */
  suit(104, 19, 'balconySuit'); rack(99, 19);
  /* SECRET ONE: the bookcase alcove hangs from the roof over the balcony; its bookcase swaps when nobody faces it */
  fill(120, 129, 9, 9, T.SOLID); fill(129, 129, 10, 13, T.SOLID); fill(120, 129, 14, 14, T.SOLID);
  const case1 = panel('bookcase', col(123, 10, 13), [], {});
  shelf(116, 119, 17);                                                              /* a step up off the balcony to the alcove's ledge */
  ent('silver', 127, 13); coins([125, 13], [126, 13]);
  ground(132, 139, 30); coins([134, 29]); shelf(133, 138, 27); polter(137, 22, 'stairPolter');

  // ================= 3. THE LONG GALLERY (140-209): REMIX - THE BLACKOUT =================
  roof(140, 209, 10);
  ground(140, 209, 30); sign(141, 29, MN_SAY.long); stand(143, 29);
  candle(147, 28); sign(149, 29, MN_SAY.candle);
  shelf(152, 156, 27); shelf(155, 159, 25); shelf(158, 169, 22); shelf(173, 185, 22); shelf(189, 200, 22);   /* THE HIGH WAY: the gallery's upper walk, two gaps in it */
  candle(158, 28); candle(166, 20); candle(168, 28); candle(178, 28); candle(180, 20); candle(190, 28); candle(194, 20); candle(204, 26);
  shade(162, 26, 'blackShades'); shade(174, 18, 'blackShades', 1); shade(184, 26, 'blackShades'); shade(192, 17, 'blackShades', 1); shade(198, 26, 'blackShades');
  polter(185, 15, 'galleryPolter2');
  coins([162, 21], [164, 21], [176, 21], [180, 21], [192, 21], [196, 21], [175, 29]);
  ground(196, 209, 28); ent('check', 198, 27); stand(201, 27);                        /* SHRINE ONE, at the gallery's far door (a second stand to relight from) */

  // ================= 4. THE NURSERY WING (210-273): EXAM =================
  roof(210, 273, 8);
  ground(210, 273, 30); fill(210, 213, 28, 29, T.SOLID); sign(211, 27, MN_SAY.nursery);
  suit(218, 29, 'wingSuit'); rack(222, 29); polter(220, 22, 'wingPolter');
  const door3 = movingDoor(226, 9, 30, 14);                                          /* the wing's MOVING DOOR: among the foes this time */
  boo(232, 24, 'wingBoos'); boo(236, 22, 'wingBoos', 1);
  portrait(234, 28); coins([230, 29], [231, 29]);
  ground(240, 246, 28); suit(244, 27, 'wingSuit2'); rack(241, 27); shelf(247, 252, 25); polter(250, 18, 'wingPolter2'); coins([248, 24], [250, 24]);
  /* THE SEALED NURSERY: a room hung from the roof, its door shut until three portraits give three keys (SECRET TWO) */
  shelf(253, 261, 22); fill(262, 271, 9, 16, T.SOLID); fill(271, 271, 17, 21, T.SOLID); fill(262, 271, 22, 22, T.SOLID);
  const nDoor = { id: 'nd0', cells: col(262, 17, 21) }; doors.push(nDoor); for (const [x, y] of nDoor.cells) set(x, y, T.AIR); ent('mndoor', 262, 21, { id: nDoor.id });
  sign(255, 21, MN_SAY.sealed); ent('silver', 267, 21); coins([264, 21], [265, 21], [268, 21], [269, 21]);
  suit(258, 29, 'wingSuit3'); rack(266, 29); coins([270, 29]);

  // ================= 5. THE ARMOURY DOOR (274-287) =================
  ground(274, 287, 30); sign(276, 29, MN_SAY.door); ent('check', 280, 29);           /* SHRINE TWO */
  sign(285, 29, MN_SAY.exit);

  // ================= 6. THE GREAT HALL (288-339): THE CASTELLAN'S GHOST =================
  const A = MN.arena, F = A.floor;
  roof(274, 339, 8); fill(339, 339, 0, H - 1, T.SOLID); ground(288, 338, F);
  shelf(299, 303, 27); shelf(325, 329, 27);                     /* the minstrels' ledges: out of a sweep's reach, a breath */
  const aRacks = [rack(294, F - 1, { set: 'knight' }), rack(306, F - 1, { set: 'halberd' }), rack(322, F - 1, { set: 'duelist' }), rack(334, F - 1, { set: 'greatsword' })];
  const aCandles = [candle(291, F - 3, { arena: true }), candle(336, F - 3, { arena: true })];
  ent('castellan', 294, F - 1, { face: 1 });   /* (he wakes in the first rack: src/castellan-hands.js) */
  const arena = { x0: A.x0 * TS, x1: (A.x1 + 1) * TS, floor: F * TS, y0: 9 * TS, trigger: A.trigger * TS, wallL: A.wallL, wallR: A.wallR, boss: 'castellan', music: 'boss3', tint: '#9adfb0', tintA: 0.05,
    /* THE FIGHT'S GEOMETRY (src/castellan.js geom): the four racks in set order, the hall's candles */
    racks: aRacks.map(r => ({ id: r.id, set: r.set, x: r.x })), candles: aCandles.map(c => c.id), exitStair: { x: 285 * TS, y: 30 * TS } };

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 33 }, pools: [], falls: [],
    arena, manor: true,
    mn: { panels, candles, stands, racks: racks.filter(r => !r.set), arenaRacks: aRacks, portraits, doors, keysNeed: MN.keysNeed, blackout: { x0: MN.blackout.x0 * TS, x1: (MN.blackout.x1 + 1) * TS }, sections: SECTIONS, door0: door0.id, stair1: stair1.id, case1: case1.id, door3: door3.id },
    calm: [[0, W - 1, 0, H - 1]], noCoin: [[A.x0, W - 1, 0, H - 1]],
    checkRun: 200,
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: A.x0, hi: W - 1, spots: 0, why: 'THE GREAT HALL: the boss arena - no squad stands in it' }],
    unlocks: [
      { kind: 'mnshift', opens: 'a shifting panel: a doorway comes down, a stair appears, a bookcase swings - while nobody watches', hud: MN_SAY.moved },
      { kind: 'mnportrait', opens: 'a portrait key: three open THE SEALED NURSERY (a silver)', hud: MN_SAY.key },
      { kind: 'mncandelabra', opens: 'a carried light: relights candles, lights the dark', hud: MN_SAY.carry },
      { kind: 'mncandle', opens: 'a lit candle: a ward the shades will not enter', hud: MN_SAY.lit },
      { kind: 'mnrack', opens: 'an empty suit: where a knocked-out ghost runs to', hud: MN_SAY.rises },
      { kind: 'mndoor', opens: 'THE SEALED NURSERY (secret: a silver)', hud: MN_SAY.open },
    ],
    duskStart: -1, duskLen: 1, music: 'cave', night: true, glowNight: true, dark: 0.42,
    palette: { sky: [[10, 12, 12], [34, 40, 38]], far: 'unburied', mid: 'unburied', near: 'none', dress: 'none', ledges: 'beam', haze: 'rgba(154,223,176,0.06)', darkCol: '6,8,8',
      dirt: '#2a2c2e', dirtL: '#4c5052', dirtD: '#141617', grass: '#4a6a56', grassL: '#6a8a72', grassD: '#2a3a30' },
    ambient: [{ x0: 0, x1: 99999, kind: 'drip' }],
    /* THE GALLERIES, BALCONIES AND TABLES ARE THE FRAMES (tools/solid-islands.mjs): drawn as the house's own joinery (the art lane's kit) */
    hullZones: shelves.map(([a, b, y]) => [a, b, y, y]),
    reachExact: false,
    mnRule: MN_RULE,
  };
}
