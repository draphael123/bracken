// src/well-town.js - THE WELL TOWN, desert arc level 2 (claude/welltown, the GREYBOX: geometry, the water rule, the machines, the encounters,
// the wiring). Concept: docs/concepts/the-well-town.md (the brief docs/briefs/well-town.md as overridden by the 2026-10-01 desert-arc concept).
// The draft it grew from is src/draft/well-town.js (tools/draft-level.mjs well-town still measures that structure); this file is the level the
// game runs, laid by hand so the encounters, the heights and the water budget are written where they are, not sprinkled.
//
// THE RULE: WATER IS CARRIED. A skin you fill at a well (INTERACT at a well: three sips). INTERACT away from a well pours it in front of you:
// a MUD WALL softens away, a FIRE goes out, and THE BANDIT KING, burning, is blinded in the steam. INTERACT with nothing to pour on drinks it:
// sunstroke cured outright. Bandits hold the wells; WATER-THIEVES cut your skin and run. Said three ways (C4): the wells are the only blue in
// the town, every mud wall is cracked dark where water would take it, and the skin's sips are on the HUD under the sun meter.
//
// THE THEMED KEY: four full WATER-SKINS lie about the town (the quest, L.quest). Poured into THE DRY CISTERN under the Kasbah street, the
// cistern fills and ITS VAULT opens: the relic (THE WELL-KEEPER'S GOURD) and the third silver. The HUD counts them (WATER-SKINS n/4).
//
// SEVEN SECTIONS (columns; the street is row 30, the cisterns rows 34-40, the roofs rows 14-24):
//   0-63     THE CARAVAN GATE   TEACH fill + pour    the first well in the open sun; the gatehouse (its shade, bowmen on its top); a bricked
//                                                     house door, optional (a water-skin inside): the pour, taught where it costs nothing
//   64-149   THE LOWER MARKET   DEVELOP              stalls and awnings, the market well, THE MARKET SHRINE (the arc's shop: a lit shrine opens
//                                                     the store); THE COVERED BAZAAR - under its roof a stall fire (pour it, a sip) or over it, in
//                                                     the sun, past its bowmen (a silver on the roof walk)
//   150-205  THE WELL SQUARE    SET PIECE            THE GREAT WELL: its WINDLASS lowers the bucket into the cisterns - strike it and ride; the
//                                                     street beyond is down (the rubble), so the well is the only way on
//   166-258  THE CISTERNS       (under the square)   the pillared hall, cool and dark: scorpions, a water-thief, the cistern's own well at the
//                                                     bucket's foot, THE OLD STINGER at the gate to the rungs up (the level's gated elite)
//   259-325  THE MUD QUARTER    REQUIRED, TWISTED    two bricked lanes (a pour each) with a well held by thieves between them; THE DOVECOTE,
//                                                     the climb up to the roofs (its top: a silver)
//   326-425  THE BANDITS' ROOST  DEVELOP in the sun   rooftops in open sun (the skin is drink AND pour now), bowmen on the stacks, THE BURNING
//                                                     BARRICADE under the parapet: a pour you cannot go round
//   426-521  THE KASBAH          EXAM + BOSS          the last well, held; the Kasbah's bricked door and the fire behind it - two pours from a
//                                                     three-sip skin in the sun under a bowman; THE DRY CISTERN and its vault; the courtyard of
//                                                     THE BANDIT KING (src/bandit-king.js stageBanditKing) and the road out
import { SLOPE } from './slopes.js';
import { stageBanditKing } from './bandit-king.js';

export const WELLTOWN = { W: 522, H: 44, street: 30 };
export const SECTIONS = [['THE CARAVAN GATE', 0], ['THE LOWER MARKET', 64], ['THE WELL SQUARE', 150], ['THE CISTERNS', 166], ['THE MUD QUARTER', 259],
  ["THE BANDITS' ROOST", 326], ['THE KASBAH', 426]];
/* each mechanic's arc (tile columns) - TAUGHT, DEVELOPED, TWISTED, COMBINED/EXAMINED - read by tools/welltown.mjs and the concept page */
export const ARCS = {
  fill: { teach: [8, 14], develop: [76, 80], twist: [282, 292], exam: [446, 456] },               /* the wells: the first in the open; held by thieves later */
  pour: { teach: [44, 53], develop: [118, 124], twist: [372, 384], exam: [456, 468] },            /* a house door; a stall fire; the barricade you cannot go round; two at once */
  windlass: { teach: [172, 180], develop: [176, 178] },                                          /* THE GREAT WELL: one machine, ridden down (the set piece) */
  climb: { teach: [90, 92], develop: [320, 324], exam: [337, 353] },                              /* the bazaar posts, the dovecote, the roost's alley ladders */
  sun: { teach: [0, 28], develop: [150, 190], twist: [326, 425], exam: [440, 470] },              /* the skin is the only cure: drink it and you have less to pour */
};

export function buildWellTown({ painter, T, TS }) {
  const { W, H } = WELLTOWN, S = WELLTOWN.street;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const ground = (x0, x1, top) => { air(x0, x1, 0, top - 1); block(x0, x1, top, H - 1); };
  const boards = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const nets = []; const ladder = (x, y0, y1) => nets.push([x, y0, y1]);   /* every ladder is hung LAST, over what is carved */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ face: -1, squad }, o || {}));
  const bowman = (x, y, squad, o) => foe('archer', x, y, squad, Object.assign({ bandit: true }, o || {}));   /* THE BANDIT BOWMAN: the archer's draw and loose (RESKINNED, a man's height) */
  const thief = (x, y, squad) => foe('waterthief', x, y, squad);                                             /* THE WATER-THIEF: the cutthroat's feint and cut (RESKINNED), and he cuts your skin */
  const well = (x, y, o) => ent('skinwell', x, y, o || {});
  const shade = [], mudWalls = [], vaultDoors = [], moversExtra = [], interiors = [];
  /* A MUD WALL is a bricked-up DOORWAY: the house wall runs on above it (so it cannot be jumped), and only a pour opens it */
  const mudDoor = (x0, x1, wallTop, floorRow, rows = 3, o = {}) => { block(x0, x1, wallTop, floorRow - 1); mudWalls.push({ x0, x1, y0: floorRow - rows, y1: floorRow - 1, ...o }); ent('mudwall', x0, floorRow - 1, { x1, ...o }); };
  const fire = (x, y, o) => ent('oilfire', x, y, o || {});
  const skin = (x, y) => ent('stray', x, y, { kind: 'waterskin' });

  // ================= 1. THE CARAVAN GATE (0-63) =================
  ground(0, 15, S);
  block(0, 1, 0, H - 1);
  sign(6, S - 1, 'THE WELL TOWN. FILL YOUR SKIN AT A WELL. POUR IT ON MUD.');
  well(11, S - 1);                                                            /* THE FIRST WELL: out in the sun, before anything asks for water */
  set(16, S - 1, SLOPE.R2A); set(17, S - 1, SLOPE.R2B); ground(18, 25, S - 1);   /* a dune ramp up to the gate */
  set(26, S - 2, SLOPE.R2A); set(27, S - 2, SLOPE.R2B); ground(28, 43, S - 2);
  /* THE GATEHOUSE: the town wall's mass over a passage three rows high (its shade), bowmen on its top, a ladder up its town face */
  block(29, 41, 17, 24);
  bowman(32, 16, 'gatehouse'); bowman(37, 16, 'gatehouse');
  ladder(42, 17, 27);
  /* THE MUD HOUSE: a little house across the street, its door bricked with mud and a water-skin inside - the pour taught where it costs nothing
     (the street goes up its steps and over its roof) */
  ground(44, 63, S);
  block(44, 45, S - 2, S - 1);                                                /* its steps */
  block(46, 53, S - 4, S - 1); air(47, 52, S - 3, S - 1);                     /* the house, and its room */
  mudWalls.push({ x0: 46, x1: 46, y0: S - 3, y1: S - 1, optional: true }); ent('mudwall', 46, S - 1, { x1: 46, optional: true });
  skin(50, S - 1);                                                            /* WATER-SKIN ONE */
  interiors.push([47, 52, S - 3, S - 1, 'wtHouse']);
  foe('cutthroat', 57, S - 1, 'gate'); foe('cutthroat', 61, S - 1, 'gate');   /* the gate's two knives, on the street past the house */

  // ================= 2. THE LOWER MARKET (64-149) =================
  ground(64, 89, S);
  ent('deco', 66, S - 1, { kind: 'awning' }); ent('deco', 73, S - 1, { kind: 'awningTorn' });   /* the stalls' awnings: shade */
  shade.push([64 * TS, 76 * TS, (S - 4) * TS, S * TS + 1]);
  thief(70, S - 1, 'stalls');                                                 /* a water-thief working the stalls */
  well(77, S - 1);                                                            /* THE MARKET WELL */
  ent('check', 82, S - 1);                                                    /* CHECKPOINT ONE: THE MARKET SHRINE - lit, it is the arc's shop (buy here: src/store.js mayBuy) */
  sign(84, S - 1, 'THE MARKET. A LIT SHRINE KEEPS A SHOP.');
  ent('deco', 86, S - 1, { kind: 'cargoChest' }); ent('deco', 88, S - 1, { kind: 'rug' });
  /* THE COVERED BAZAAR: a long roof on posts, a walkway on it. Under it, shade and a stall fire across the street (pour it); on it, the sun and
     two bowmen (and a silver at its far end). The posts are ladders: either way is open */
  ground(90, 131, S);
  block(92, 129, 24, 24); boards(90, 131, 23);
  ladder(90, 23, S - 1); ladder(131, 23, S - 1);
  for (let x = 98; x < 128; x += 10) block(x, x, 25, 25);                    /* the roof's beams hang a row */
  shade.push([92 * TS, 130 * TS, 25 * TS, S * TS + 1]);
  foe('cutthroat', 103, S - 1, 'bazaar'); thief(107, S - 1, 'bazaar');
  fire(121, S - 1, { stall: true });                                         /* THE STALL FIRE: under the roof, across the way */
  bowman(110, 22, 'bazaarRoof'); bowman(117, 22, 'bazaarRoof');
  ent('silver', 128, 22);                                                     /* SILVER ONE: on the roof walk, in the sun */
  /* up to the square: the market stair */
  ground(132, 137, S); ground(138, 143, S - 2); ground(144, 149, S - 4);

  // ================= 3. THE WELL SQUARE (150-205) and THE GREAT WELL =================
  const Q = S - 4;                                                            /* the square's floor row: 26 */
  ground(150, 192, Q);
  /* THE WELL-HOUSE: a roof on two posts over the square's west side, its bowmen on it */
  boards(156, 163, Q - 5); ladder(156, Q - 5, Q - 1); ladder(163, Q - 5, Q - 1);
  bowman(159, Q - 6, 'wellhouse');
  foe('cutthroat', 167, Q - 1, 'square'); foe('cutthroat', 170, Q - 1, 'square');
  /* THE GREAT WELL: a shaft two wide from the square to the cistern's floor, its WINDLASS on the west lip (strike it: the brake comes off and the
     bucket runs down - with you on it), the well head on the east lip (fill there). The bucket is a lift that moves only on the windlass */
  const gx = 176, floorC = 40;
  air(gx, gx + 1, Q, floorC);
  ent('windlass', gx - 1, Q - 1, { bucket: 'great', top: true });
  well(gx + 3, Q - 1, { great: true });
  thief(184, Q - 1, 'wellhead');                                              /* he keeps the well head */
  moversExtra.push({ kind: 'lift', windlass: 'great', x: gx * TS, y: Q * TS, y0: Q * TS, y1: floorC * TS, w: 32, h: 8, speed: 0, locked: true });
  /* THE RUBBLE: the street east of the square fell into the cisterns - a heap twelve rows high, no way over */
  block(193, 197, 13, Q - 1); ground(193, 197, 13);
  sign(189, Q - 1, 'THE STREET IS DOWN.');

  // ================= 4. THE CISTERNS (166-258, rows 34-40, under the square and the mud quarter) =================
  const C0 = 166, C1 = 258;
  ground(198, 325, S);                                                        /* the mud quarter's street over the cisterns' east end (its west end: behind the rubble) */
  air(C0, C1, 34, 39);                                                        /* the hall: six rows */
  for (let x = 188; x < 248; x += 12) block(x, x, 34, 35);                   /* the pillars, hung from the vault: the floor passes under them */
  shade.push([C0 * TS, (C1 + 1) * TS, 34 * TS, 40 * TS + 1]);
  interiors.push([C0, C1, 34, 39, 'wtCistern']);
  well(gx + 5, 39, { cistern: true });                                        /* THE CISTERN'S OWN WELL: the water at the bucket's foot */
  ent('windlass', gx + 2, 39, { bucket: 'great', top: false });              /* the bucket's foot: the bottom windlass winds it back up */
  ent('check', 188, 39);                                                      /* CHECKPOINT TWO: at the bucket's foot */
  skin(168, 39);                                                              /* WATER-SKIN TWO: at the dark west end of the hall (a dead end) */
  foe('scorpion', 199, 39, 'cistern'); foe('scorpion', 203, 39, 'cistern');
  thief(218, 39, 'sump'); foe('scorpion', 222, 39, 'sump');
  /* THE OLD STINGER: the cistern's elite holds the gate in front of the rungs up (eliteGates: it opens when he dies) */
  ent('scorpion', 244, 39, { face: -1, elite: true, gate: 251 });
  /* the rungs up into the mud quarter: a shaft through the street */
  air(255, 256, S, 33); ladder(255, S, 39); ladder(256, S, 39);
  skin(205, S - 1);                                                           /* WATER-SKIN THREE: on the dead street behind the rubble (west of the rungs: a dead end) */

  // ================= 5. THE MUD QUARTER (259-325) =================
  mudDoor(262, 263, 17, S);                                                   /* MUD WALL ONE: the first lane, bricked */
  ground(268, 277, S - 2); boards(270, 275, 24);                              /* a step up, and a balcony over it */
  bowman(272, 23, 'balcony');
  shade.push([270 * TS, 276 * TS, 25 * TS, (S - 2) * TS + 1]);
  well(283, S - 1);                                                           /* THE MUD QUARTER'S WELL, held */
  ent('check', 280, S - 1);                                                   /* CHECKPOINT THREE */
  thief(287, S - 1, 'well2'); thief(290, S - 1, 'well2');
  mudDoor(296, 297, 17, S);                                                   /* MUD WALL TWO: the second lane */
  ground(300, 305, S - 2); ground(306, 311, S);
  foe('cutthroat', 308, S - 1, 'lane2'); foe('cutthroat', 312, S - 1, 'lane2');
  /* THE DOVECOTE: a tower, rungs up its middle, a door through its foot, a window on its east face at the roofs' height, a hatch in its roof (and a
     silver on top: a dead end up) */
  { const x = 320; block(x, x + 4, 11, S - 1); air(x + 1, x + 3, 12, S - 1); air(x, x, S - 3, S - 1); ladder(x + 2, 11, S - 1);
    air(x + 4, x + 4, 15, 17); set(x + 3, 18, T.ONEWAY); block(x, x + 4, 11, 11); set(x + 2, 11, T.NET);   /* the window, and a sill off the ladder to it */
    ent('silver', x + 2, 8); interiors.push([x + 1, x + 3, 12, S - 1, 'wtDovecote']); }

  // ================= 6. THE BANDITS' ROOST (326-425): rooftops in the open sun =================
  /* the houses stand solid from their roofs down to the street; the alleys between them drop to the street, a ladder in each */
  ground(326, 425, S);
  const house = (x0, x1, roof) => block(x0, x1, roof, S - 1);
  house(325, 336, 18);
  ladder(337, 18, S - 1);
  house(340, 350, 20); boards(345, 349, 15); ladder(347, 15, 19);          /* a perch on a pole over house B's roof: the bowman's */
  bowman(347, 14, 'perch1');
  foe('cutthroat', 341, 19, 'roofB'); foe('cutthroat', 344, 19, 'roofB');
  ladder(353, 17, S - 1);
  house(354, 366, 17);
  thief(360, 16, 'roofC');
  /* THE BURNING BARRICADE: house D's roof walk runs under the parapet (two rows high) and the bandits have set it alight. No way over the parapet,
     none under the house: pour it out */
  house(367, 384, 19); block(372, 384, 8, 16);
  fire(376, 18, { barricade: true });
  shade.push([372 * TS, 385 * TS, 17 * TS, 19 * TS + 1]);
  ladder(387, 19, S - 1);
  house(388, 400, 21);
  foe('cutthroat', 392, 20, 'roofE'); foe('cutthroat', 396, 20, 'roofE');
  house(401, 420, 24); boards(401, 405, 18);                                  /* a lower terrace, and a chimney ledge over it (a hop up from house E) */
  skin(404, 17);                                                              /* WATER-SKIN FOUR: up on the chimney ledge */
  thief(414, 23, 'terrace'); bowman(418, 23, 'terrace');
  ground(421, 425, 26);

  // ================= 7. THE KASBAH (426-521): the exam, the dry cistern, the courtyard =================
  const K = 28;                                                               /* the Kasbah street's floor row */
  ground(426, 472, K);
  /* THE DRY CISTERN: under the street, down a hole by its own ladder. Pour the four water-skins in (INTERACT at it): it fills and THE VAULT opens */
  air(431, 446, K + 1, K + 4); block(431, 446, K + 5, H - 1); air(431, 431, K, K); ladder(431, K, K + 4);
  ent('cistern', 437, K + 4);
  block(441, 441, K + 1, K + 4); vaultDoors.push({ x0: 441, x1: 441, y0: K + 1, y1: K + 4 });
  ent('relic', 444, K + 4, { kind: 'gourd' }); ent('silver', 445, K + 4);  /* the vault: the relic, and SILVER THREE */
  interiors.push([431, 446, K + 1, K + 4, 'wtCistern']);
  /* THE EXAM: the last well, held by thieves and a bowman over it; then the Kasbah's bricked door and, behind it, a fire under the gateway's
     lintel - two pours, a three-sip skin, the sun and a bowman */
  well(448, K - 1);
  boards(450, 454, 22); ladder(449, 22, K - 1);
  bowman(452, 21, 'kasbahLedge');
  thief(451, K - 1, 'kasbahWell'); thief(455, K - 1, 'kasbahWell');
  mudDoor(458, 459, 12, K);                                                   /* MUD WALL THREE: the Kasbah's door */
  block(460, 468, 22, 24);                                                    /* the gateway's lintel: a passage three rows high */
  fire(464, K - 1, { gateway: true });                                        /* and a fire in it */
  shade.push([460 * TS, 469 * TS, 25 * TS, K * TS + 1]);
  ent('check', 470, K - 1);                                                   /* CHECKPOINT FOUR: the courtyard door */
  /* THE COURTYARD: THE BANDIT KING's arena (src/bandit-king.js), forty tiles from 474, his walls at 473 and 514, the road out past 514 */
  ground(473, W - 1, K);
  const king = stageBanditKing({ set, block, ent, air }, T, TS, 474, K);
  shade.push([473 * TS, 515 * TS, (K - 16) * TS, K * TS + 1]);                /* the courtyard lies in the shadow of the Kasbah's walls: his fight is not the sun's (the skin is for pouring here) */
  ent('gate', 517, K - 1);
  block(W - 2, W - 1, 0, H - 1);

  // ================= THE LADDERS, LAST =================
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  const START = { x: 3, y: S - 1 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra, interiors,
    arena: king.arena, gateAfterBoss: true,
    welltown: true,
    mudWalls, vaultDoors,
    shade, shadeArt: shade.slice(),
    quest: { n: 4, item: 'waterskin', name: 'WATER-SKINS', done: 'FOUR SKINS: POUR THEM IN THE DRY CISTERN', thanks: 'THE CISTERN IS FULL' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,                  /* four checkpoints (Daniel: fewer); src/level.js checkpoints() must not fill between them */
    /* WHAT EACH THING OPENS, and the line that says so (tools/level-quality.mjs `unlocks`; the lines are src/hint-lines.js callouts the hands say) */
    unlocks: [
      { kind: 'stray', opens: 'THE DRY CISTERN\'s vault (the relic and the third silver) once all four are poured in', hud: 'WATER-SKINS n/4 (the quest counter); at the cistern: POUR THE SKINS IN: THE VAULT OPENS' },
      { kind: 'skinwell', opens: 'your skin: three sips to pour or drink', hud: 'YOUR SKIN IS FULL: E POURS, E DRINKS' },
      { kind: 'mudwall', opens: 'the lane it bricks (a pour)', hud: 'MUD: POUR YOUR SKIN ON IT' },
      { kind: 'oilfire', opens: 'the way it burns across (a pour)', hud: 'THE FIRE IS OUT - GO' },
      { kind: 'windlass', opens: 'the bucket down THE GREAT WELL into the cisterns (and back up)', hud: 'STRIKE THE WINDLASS: THE BUCKET GOES DOWN' },
      { kind: 'cistern', opens: 'THE DRY CISTERN\'s vault: the relic and the third silver', hud: 'THE CISTERN FILLS: THE VAULT OPENS' },
    ],
    music: 'caravan',   /* TODO(Daniel picks the track): a PLACEHOLDER, THE SUNKEN CARAVAN's own track borrowed until the Well Town has its own CC0/CC-BY file (tools/level-quality.mjs REPORT_ONLY lists the borrow). Nothing was downloaded */
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    sun: true, caravan: true,   /* THE SUN (src/sunstroke.js) and the desert's hands in main.js (the sun meter, the shade, the sand and stone skins, the bandits' AI) */
    ledgeKit: 'desert',
    palette: { set: 'desert', near: 'none', dress: 'desert', noFg: true, noNear: true, haze: 'rgba(236,206,160,0.10)' },
    duskStart: -1, duskLen: 1,
  };
}
