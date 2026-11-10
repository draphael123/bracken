/* src/wispwood.js - WISPWOOD (claude/wispwood, the OPUS GREYBOX; scratch/brief-wispwood-1108.md, Daniel 11-08; behind WISPWOOD_SHIPS, src/ww-flag.js).
   Road: THE BURIAL CAVERNS -> (climb out of the barrow) WISPWOOD -> THE WITCHLIGHT STAIR today (THE SILK UNDERCROFT when it lands: the exit is a root-hole down).
   The dead wood over the barrows: pale bark, no leaves, a black mere between the oaks, and wisps. RULE: 'WHAT THE LIGHT TOUCHES IS REAL.'
   THE VERBS (src/wispwood-hands.js runs them):
     THE GLOW        every hero carries a GHOST LANTERN. SPECTRAL tiles (pale branches, bridges, ladder rungs) are solid only while a light reaches them. They are
                     ONEWAY in this grid (the lit state: reach, pacing and the quality bar read it) and the hands set each one to AIR while no light touches it.
     CANDLES/LAMPS   a GRAVE CANDLE struck with a lit lantern burns 12 s; a HANGING LAMP struck burns until something snuffs it; a WAYSTONE never goes out.
                     Each is a light: it holds the spectral tiles near it, keeps the hands down, and relights a dead lantern by touch.
     SHADOW HANDS    pools of dark ground: a hand rises at the nearest UNLIT column of the pool and lunges along the ground (told). Light decides where they rise.
     WISP THIEVES    steal your flame and flee with it (their glow keeps the bridges real near THEM): strike the thief and the light comes home.
   SECTIONS (columns):   0-47  THE PALE EDGE       TEACH    the barrow mouth, the lantern, the first pale branch over a shallow ditch, a candle, the first hand pool
                        48-119 THE HOLLOW OAKS      DEVELOP  pale ladders up dead oaks, the first bridge over THE BLACK MERE, lamps; the oak-crown silver
                       120-179 THE WISP ROAD        TWIST    a thief on firm ground, then thieves over a candle-held bridge; waystone + SHRINE ONE
                       180-259 THE DROWNED GLADE    EXAM     islands, pale stairs and bridges over the mere, hands, thieves, the dead; the grotto silver
                       260-273 THE WIDOW'S GATE              SHRINE TWO
                       274-327 THE WIDOW'S GLADE    BOSS     THE LANTERN WIDOW (src/lantern-widow.js)
   THE BLACK MERE has no floor: a hero who falls past ww.catchY is dragged back by the hands (16, spare: never a death) onto the last firm footing.
   CHECKPOINTS (Daniel: fewer): START + 2 shrines (cols 172 and 265). L.checkRun 200: the filler adds none. Placed wholly by hand (calm: nothing sprinkled).
   GRID: 330 x 44; the wood's floor is row 32 at the barrow mouth and climbs to 24 over the oaks; the oak crowns stand at row 14. */
import { WW_RULE, WW_SAY } from './ww-lines.js';

export const WW = {
  W: 330, H: 44,
  catchY: 37 * 16,            /* px: a hero whose feet pass this line is in THE BLACK MERE */
  arena: { x0: 274, x1: 327, wallL: 273, wallR: 328, trigger: 277, floor: 32 },
};
export const SECTIONS = [['THE PALE EDGE', 0, 48], ['THE HOLLOW OAKS', 48, 120], ['THE WISP ROAD', 120, 180], ['THE DROWNED GLADE', 180, 260], ["THE WIDOW'S GATE", 260, 274], ["THE WIDOW'S GLADE", 274, 330]];

export function buildWispwood({ painter, T, TS }) {
  const { W, H } = WW;
  const L = painter(W, H), { set, ent } = L;
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const ground = (x0, x1, top) => fill(x0, x1, top, H - 1, T.SOLID);
  const trunks = [];                                                           /* the dead oaks' trunks (the art lane's bark kit: src/redraw/wispwood_art.js) */
  const stump = (x0, x1, top) => { fill(x0, x1, top, H - 1, T.SOLID); trunks.push({ x0, x1, top, bot: H - 1 }); };          /* a drowned stump: rock-hard, down to the mere's bottomless floor */
  const bough = (x0, x1, y) => fill(x0, x1, y, y, T.ONEWAY);                 /* a real dead bough (one-way) */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const spans = [], candles = [], lamps = [], stones = [], pools = [], meres = [];
  /* A SPECTRAL SPAN: pale branch / bridge / rung, ONEWAY in the built grid (the lit state); the hands make it AIR while no light reaches it */
  const spectral = (x0, x1, y, kind = 'branch') => { fill(x0, x1, y, y, T.ONEWAY); const s = { id: 'sp' + spans.length, x0, x1, y, kind }; spans.push(s); ent('wwspan', x0, y - 1, { id: s.id, w: x1 - x0 + 1, kind }); return s; };
  const candle = (x, y) => { const c = { id: 'cd' + candles.length, x: x * TS + 8, y: (y + 1) * TS, col: x, row: y }; candles.push(c); ent('wwcandle', x, y, { id: c.id }); return c; };
  const lamp = (x, y, o = {}) => { const c = { id: 'lp' + lamps.length, x: x * TS + 8, y: (y + 1) * TS, col: x, row: y, arena: !!o.arena }; lamps.push(c); ent('wwlamp', x, y, { id: c.id }); return c; };
  const stone = (x, y) => { const c = { id: 'ws' + stones.length, x: x * TS + 8, y: (y + 1) * TS, col: x, row: y }; stones.push(c); ent('wwstone', x, y, { id: c.id }); return c; };
  /* A POOL OF SHADOW: the ground row a hand rises out of (y = the row heroes stand in), columns x0..x0+w-1 */
  const pool = (x0, y, w) => { const p = { id: 'hp' + pools.length, x0, x1: x0 + w - 1, y }; pools.push(p); ent('wwhands', x0, y, { id: p.id, w }); return p; };
  const mere = (x0, x1) => meres.push({ x0, x1 });
  const foe = (t, x, y, squad, o = {}) => ent(t, x, y, { squad, ...o });
  const thief = (x, y, squad) => ent('wwthief', x, y, { squad });

  // ================= 1. THE PALE EDGE (0-47): TEACH =================
  ground(0, 14, 32); fill(0, 1, 20, 31, T.SOLID); fill(2, 6, 26, 26, T.SOLID);     /* the barrow hill and the mouth's lintel stone: you climb out of the Burial Caverns here */
  sign(3, 31, WW_SAY.start); stone(8, 31); sign(11, 31, WW_SAY.rule);
  foe('zombie', 12, 31, 'edgeDead', { face: -1 });
  ground(15, 19, 35); spectral(15, 19, 32, 'bridge');                               /* THE FIRST PALE BRANCH, over a shallow ditch: walk it in your glow (a miss costs a climb, nothing more) */
  coins([17, 31], [17, 34]);
  ground(20, 40, 30); sign(21, 29, WW_SAY.candle); candle(23, 29);
  sign(27, 29, WW_SAY.hands); pool(30, 29, 10);                                     /* THE FIRST HANDS, on firm ground: they rise at the edge of your glow */
  spectral(21, 29, 27); spectral(32, 38, 27); coins([25, 26], [33, 26], [35, 26], [37, 26]);   /* pale branches over the candle and the pool (the second height) */
  foe('husk', 37, 29, 'edgeHusk', { face: -1 });
  ground(41, 47, 27); foe('bonearcher', 45, 26, 'edgeArcher', { face: -1 }); spectral(42, 50, 23); coins([47, 22]);

  // ================= 2. THE HOLLOW OAKS (48-119): DEVELOP =================
  ground(48, 57, 26); foe('corpse', 51, 25, 'oakRoot', { face: -1, risen: true }); pool(48, 25, 7);
  sign(49, 25, WW_SAY.oaks);
  fill(56, 57, 15, 25, T.SOLID); trunks.push({ x0: 56, x1: 57, top: 15, bot: 25 }); bough(54, 61, 14);                                 /* OAK ONE: its trunk on the bank, its crown a real bough at row 14 */
  spectral(53, 55, 23, 'rung'); spectral(52, 54, 20, 'rung'); spectral(53, 55, 17, 'rung');   /* the pale ladder up its west side */
  coins([53, 22], [53, 16]);
  mere(58, 89); sign(58, 13, WW_SAY.mere);
  spectral(62, 75, 14, 'bridge');                                                   /* THE FIRST BRIDGE over the mere, crown to crown */
  foe('boo', 68, 11, 'mereBoo'); foe('bat', 72, 8, 'mereBat', { perch: true });
  stump(79, 80, 15); bough(76, 83, 14);                                             /* OAK TWO, standing in the mere */
  lamp(77, 13); foe('bonearcher', 82, 13, 'oakTwo', { face: -1 });
  spectral(78, 80, 11, 'branch'); spectral(81, 83, 8, 'branch'); ent('silver', 82, 7); coins([79, 10]);   /* SECRET ONE: the crown of oak two, a dead end up its pale boughs */
  spectral(84, 89, 14, 'bridge');
  /* THE ROOT WALK: the low road through the mere, on the drowned roots - in the dark, with the hands - and through oak two's hollow trunk; pale rungs up to the far bank */
  const roots = [[59, 66], [69, 77], [83, 88]]; for (const [a, b] of roots) bough(a, b, 30); fill(79, 80, 27, 29, T.AIR); bough(78, 81, 30); pool(59, 29, 8); pool(69, 29, 9); pool(83, 29, 6);
  spectral(87, 89, 27, 'rung'); spectral(87, 89, 24, 'rung'); spectral(88, 89, 21, 'rung'); coins([62, 29], [73, 29], [80, 29]); foe('zombie', 72, 29, 'rootDead', { face: -1 });
  ground(90, 95, 18); ground(96, 101, 21); ground(102, 119, 24);                    /* the far bank, terraced down */
  coins([92, 17], [98, 20]);
  lamp(104, 23); pool(103, 23, 14);
  spectral(106, 125, 20); coins([107, 19], [109, 19], [111, 19], [121, 19]);
  foe('husk', 99, 20, 'bankDead', { face: -1 }); foe('zombie', 108, 23, 'bankDead', { face: -1 });
  foe('wight', 113, 23, 'bankWight', { face: -1 }); foe('haunt', 117, 20, 'bankHaunt');

  // ================= 3. THE WISP ROAD (120-179): TWIST =================
  ground(120, 140, 24); sign(121, 23, WW_SAY.thief); stone(125, 23);
  thief(133, 19, 'roadThief'); spectral(128, 136, 21); coins([134, 20], [136, 20]);   /* a pale branch over the road, a dead end that pays */                                                      /* THE FIRST THIEF, over firm ground: lose your light here and nothing falls */
  coins([129, 23], [136, 23]);
  sign(137, 23, WW_SAY.thiefBridge); candle(139, 23);
  mere(141, 158); stump(149, 150, 24); candle(149, 23);
  spectral(141, 148, 24, 'bridge'); spectral(151, 158, 24, 'bridge');               /* THE CANDLE BRIDGE: light both candles, then cross with the thief above */
  thief(150, 18, 'bridgeThief'); coins([145, 23], [154, 23]);
  ground(159, 179, 26); lamp(160, 25);
  spectral(162, 178, 23); coins([163, 22], [166, 22], [169, 22], [177, 22]);
  pool(161, 25, 7); foe('husk', 165, 25, 'roadHusk', { face: -1 });
  sign(168, 25, WW_SAY.stone); stone(170, 25);
  ent('check', 172, 25);                                                            /* SHRINE ONE */
  coins([176, 25]);

  // ================= 4. THE DROWNED GLADE (180-259): EXAM =================
  ground(180, 190, 28); spectral(182, 190, 25); coins([186, 24]); sign(181, 27, WW_SAY.glade); foe('bonearcher', 187, 27, 'gladeArcher', { face: -1 });
  mere(191, 240);
  spectral(191, 200, 28, 'bridge');
  stump(201, 205, 27); candle(204, 26); pool(201, 26, 5); thief(203, 21, 'islandThief');
  spectral(206, 210, 25); spectral(211, 215, 22);
  spectral(206, 208, 30, 'rung'); spectral(209, 211, 33, 'rung');                   /* off the island's east edge, DOWN: the grotto's pale rungs under the stairs */
  bough(212, 218, 35); candle(213, 34); ent('silver', 216, 34); coins([214, 34]);   /* SECRET TWO: the drowned root-shelf under the pale stairs (a candle to hold the rungs while you climb back) */
  spectral(216, 230, 22, 'bridge'); lamp(223, 21);                                  /* a lamp on the long bridge (its post stands in the mere) */
  foe('boo', 219, 18, 'bridgeBoo');
  stump(231, 233, 22); candle(232, 21); thief(232, 16, 'stumpThief');
  spectral(234, 240, 25, 'bridge');
  ground(241, 259, 27); stone(243, 26); pool(244, 26, 10);
  foe('armour', 247, 26, 'gladeKnight', { face: -1 }); foe('husk', 252, 26, 'gladeKnight', { face: -1 }); foe('haunt', 256, 22, 'gladeHaunt');
  coins([249, 26], [258, 26]); spectral(244, 256, 24); coins([255, 23], [256, 23]);   /* a pale branch over the knight, a dead end that pays */

  // ================= 5. THE WIDOW'S GATE (260-273) =================
  ground(260, 266, 27); sign(262, 26, WW_SAY.gate); ent('check', 265, 26);         /* SHRINE TWO */
  ground(267, 270, 29); ground(271, 273, 32);

  // ================= 6. THE WIDOW'S GLADE (274-327): THE LANTERN WIDOW =================
  const A = WW.arena, F = A.floor;
  ground(274, 290, F); ground(310, 327, F); mere(291, 309);
  const aSpans = [spectral(291, 309, F, 'bridge'), spectral(278, 284, 29), spectral(314, 320, 29), spectral(286, 292, 26), spectral(306, 312, 26), spectral(296, 304, 23)];
  const aLamps = [lamp(275, F - 1, { arena: true }), lamp(288, F - 1, { arena: true }), lamp(312, F - 1, { arena: true }), lamp(326, F - 1, { arena: true })];
  fill(328, 329, 0, H - 1, T.SOLID);
  ent('lanternwidow', 300, 22, { face: -1 });
  sign(272, 31, WW_SAY.exit);
  const arena = { x0: A.x0 * TS, x1: (A.x1 + 1) * TS, floor: F * TS, y0: 4 * TS, trigger: A.trigger * TS, wallL: A.wallL, wallR: A.wallR, boss: 'lanternwidow', music: 'boss4', tint: '#b8d8ff', tintA: 0.05,
    /* THE FIGHT'S GEOMETRY (src/lantern-widow.js geom): her perches (px, where she hovers), the mere, the rim lamps, the spectral spans of the glade */
    perches: [[281, 28], [317, 28], [289, 25], [309, 25], [300, 22]].map(([x, y]) => ({ x: x * TS + 8, y: (y + 1) * TS })),
    mere: [291 * TS, 310 * TS], lamps: aLamps.map(l => l.id), spans: aSpans.map(s => s.id), exitHole: { x: 300 * TS, y: (F + 1) * TS } };

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 31 }, pools: [], falls: [],
    arena, wispwood: true,
    ww: { spans, candles, lamps, stones, pools, meres, trunks, catchY: WW.catchY, sections: SECTIONS },
    calm: [[0, W - 1, 0, H - 1]], noCoin: [[A.x0, W - 1, 0, H - 1]],
    checkRun: 200,
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: A.x0, hi: W - 1, spots: 0, why: "THE WIDOW'S GLADE: the boss arena - no squad stands in it" }],
    unlocks: [
      { kind: 'wwspan', opens: 'a pale branch, bridge or rung: solid only in the light', hud: WW_RULE },
      { kind: 'wwcandle', opens: 'a light for 12 s: holds the pale branches near it, keeps the hands down, relights a dead lantern', hud: WW_SAY.lit },
      { kind: 'wwlamp', opens: 'a light until something snuffs it', hud: WW_SAY.lit },
      { kind: 'wwstone', opens: 'a light that never goes out: relights a dead lantern', hud: WW_SAY.relit },
    ],
    duskStart: -1, duskLen: 1, music: 'cave', night: true, glowNight: true, dark: 0.42,
    palette: { sky: [[10, 14, 26], [40, 52, 70]], far: 'unburied', mid: 'unburied', near: 'none', dress: 'none', ledges: 'beam', haze: 'rgba(170,200,230,0.10)', darkCol: '6,10,18',
      dirt: '#3a3c44', dirtL: '#6a6e78', dirtD: '#1e2028', grass: '#5a6470', grassL: '#9aa6b0', grassD: '#2a3038' },
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    /* THE PALE SPANS AND THE DROWNED ROOTS ARE THE FRAMES (tools/solid-islands.mjs): a spectral span is drawn as the light that makes it (src/wispwood-hands.js drawOver; the art lane's ghost-wood), the root walk as the oaks' drowned roots */
    hullZones: spans.map(s => [s.x0, s.x1, s.y, s.y]).concat(roots.map(([a, b]) => [a, b, 30, 30]), [[212, 218, 35, 35]]),
    reachExact: false,
    wwRule: WW_RULE,
  };
}
