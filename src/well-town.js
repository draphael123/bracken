// src/well-town.js - THE WELL TOWN, desert arc level 2 (claude/welltown, the GREYBOX: geometry, the water rule, the machines, the encounters,
// the wiring). Concept: docs/concepts/the-well-town.md (the brief docs/briefs/well-town.md as overridden by the 2026-10-01 desert-arc concept).
// The draft it grew from is src/draft/well-town.js (tools/draft-level.mjs well-town still measures that structure); this file is the level the
// game runs, laid by hand so the encounters, the heights and the water budget are written where they are, not sprinkled.
//
// THE RULE: WATER IS CARRIED. A skin you fill at a well (INTERACT at a well: three sips). INTERACT away from a well pours it in front of you:
// a MUD WALL softens away, a FIRE goes out, and under the town THE CISTERN QUEEN is flooded out of her burrow and off her walls. INTERACT with nothing to pour on drinks it:
// sunstroke cured outright. Bandits hold the wells; WATER-THIEVES cut your skin and run. Said three ways (C4): the wells are the only blue in
// the town, every mud wall is cracked dark where water would take it, and the skin's sips are on the HUD under the sun meter.
//
// THE THEMED KEY: four full WATER-SKINS lie about the town (the quest, L.quest). Poured into THE DRY CISTERN under the Kasbah street, the
// cistern fills and ITS VAULT opens: the third silver and a purse of coins (no relic: Daniel 10-02, relics are leaving the game). The HUD
// counts them (WATER-SKINS n/4).
//
// SEVEN SECTIONS (columns; the street is row 30, the cisterns rows 34-40, the roofs rows 14-24):
//   0-63     THE CARAVAN GATE   TEACH fill + pour    the first well in the open sun; the gatehouse (its shade, bowmen on its top); a bricked
//                                                     house door, optional (a water-skin inside): the pour, taught where it costs nothing
//   64-149   THE LOWER MARKET   DEVELOP              stalls and awnings, the market well, THE MARKET SHRINE (the arc's shop: a lit shrine opens
//                                                     the store); THE COVERED BAZAAR - under its roof a stall fire (pour it, a sip) or over it, in
//                                                     the sun, past its bowmen (a silver on the roof walk)
//   150-205  THE WELL SQUARE    MINI + SET PIECE     THE MARKET COURTYARD (150-192): THE GANG LEADER, a mini (src/gang-leader.js stageGangLeader). THE GREAT WELL: its WINDLASS lowers the bucket into the cisterns - strike it and ride; the
//                                                     street beyond is down (the rubble), so the well is the only way on
//   166-258  THE CISTERNS       (under the square)   the pillared hall, cool and dark: scorpions, a water-thief, the cistern's own well at the
//                                                     bucket's foot, THE OLD STINGER at the gate to the rungs up (the level's gated elite)
//   259-325  THE MUD QUARTER    REQUIRED, TWISTED    two bricked lanes (a pour each) with a well held by thieves between them; THE DOVECOTE,
//                                                     the climb up to the roofs (its top: a silver)
//   326-425  THE BANDITS' ROOST  DEVELOP in the sun   rooftops in open sun (the skin is drink AND pour now), bowmen on the stacks, THE BURNING
//                                                     BARRICADE under the parapet: a pour you cannot go round
//   426-521  THE KASBAH          EXAM + BOSS          the last well, held; the Kasbah's bricked door and the fire behind it - two pours from a
//                                                     three-sip skin in the sun under a bowman; THE DRY CISTERN and its vault; the garrison's
//                                                     courtyard (its well, its knives and two bowmen); THE OLD WELL down into
//                                                     THE QUEEN'S CISTERN under the street (src/cistern-queen.js stageCisternQueen) and the road out
//
// THE SHADE PLAN (claude/welltown-fix, the review's P1: the sun did 88% of a level-1 hero's damage). Every fight and climb stands in shade a
// PROP casts - a market awning (`awn`, the caravan's own deco art; its shade is SHADE_OF.awning's span, so the art and the rule are the same
// pixels), the well-house's solid roof, the gatehouse, the bazaar roof, the balcony, the dovecote's walls, the parapet, the Kasbah's gateway -
// and no walk between two shades on the route is longer than SUN.maxWalk (tools/welltown.mjs THE SUN walks the pacing route and holds it).
// The roofs' bandits stand IN their roof's awning: the shade is taken from them.
import { SLOPE } from './slopes.js';
import { stageGangLeader } from './gang-leader.js';
import { stageDjinn } from './djinn.js';   /* (claude/welltown5, Daniel 10-03: THE DJINN OF THE GREAT WELL is the town's boss; THE CISTERN QUEEN is benched for a level of her own - src/cistern-queen.js stageCisternQueen is kept, unplaced) */
import { SHADE_OF } from './redraw/desert.js';

export const WELLTOWN = { W: 704, H: 60, street: 30 };   /* (claude/djinn2: 584 -> 664, THE BINDING WORKS under the Kasbah before his hall; claude/djinn3: 664 -> 704, THE STEAM WORKS) */
export const SECTIONS = [['THE CARAVAN GATE', 0], ['THE LOWER MARKET', 64], ['THE WELL SQUARE', 150], ['THE CISTERNS', 166], ['THE MUD QUARTER', 259],
  ["THE BANDITS' ROOST", 326], ['THE KASBAH', 426], ['THE BINDING WORKS', 514], ['THE STEAM WORKS', 578]];
/* THE STEAM WORKS (claude/djinn3, Daniel 10-04: the binding works "needs to use WATER more and be a little LONGER"): the old waterworks' boiler run, where
   his fire leaks up through the floor. FLAME VENTS fire on a rhythm - a glow (told), then a jet - and a POUR on one CAPS it for VENT.cap s (the water verb
   as your tool); under the flooded trough they blow STEAM (time it: nothing caps a vent under water); THE BELLOWS VENT never stops - cap it or go no further */
export const VENTS = { teach: [578, 591], steam: [592, 603], bellows: [604, 617] };
/* each mechanic's arc (tile columns) - TAUGHT, DEVELOPED, TWISTED, COMBINED/EXAMINED - read by tools/welltown.mjs and the concept page */
export const ARCS = {
  fill: { teach: [8, 14], develop: [76, 80], twist: [282, 292], exam: [446, 456] },               /* the wells: the first in the open; held by thieves later */
  pour: { teach: [44, 53], develop: [118, 124], twist: [372, 384], exam: [456, 468] },            /* a house door; a stall fire; the barricade you cannot go round; two at once */
  windlass: { teach: [172, 180], develop: [176, 178], exam: [446, 448] },                        /* THE GREAT WELL: ridden down (the set piece); the exam's DEEP WELL: wound up under fire */
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
  const thief = (x, y, squad) => foe('waterthief', x, y, squad);
  /* (claude/desertfoes, Daniel 10-03: the town was mostly cutthroats - a good chunk of them are swapped for these) THE FIRE SCORPION (the scorpion's AI in ember: its sting
     and its death leave a BURNING PATCH that the POUR puts out), THE VENOM SCORPION (the Cistern Queen's brood: its sting slows your stamina), THE VULTURE (its
     shadow is moving shade on the roofs: src/sunstroke.js vultureShade). src/desert-foes2.js */
  const fireScorp = (x, y, squad) => foe('scorpion', x, y, squad, { cnSkin: 'firescorpion' });
  const venomScorp = (x, y, squad) => foe('scorpion', x, y, squad, { cnSkin: 'venomscorpion' });
  const vulture = (x, y, squad) => foe('vulture', x, y, squad);                                             /* THE WATER-THIEF: the cutthroat's feint and cut (RESKINNED), and he cuts your skin */
  const well = (x, y, o) => ent('skinwell', x, y, o || {});
  const shade = [], cast = [], mudWalls = [], vaultDoors = [], moversExtra = [], interiors = [], wtPools = [];
  /* A MUD WALL is a bricked-up DOORWAY: the house wall runs on above it (so it cannot be jumped), and only a pour opens it */
  const mudDoor = (x0, x1, wallTop, floorRow, rows = 3, o = {}) => { block(x0, x1, wallTop, floorRow - 1); mudWalls.push({ x0, x1, y0: floorRow - rows, y1: floorRow - 1, ...o }); ent('mudwall', x0, floorRow - 1, { x1, ...o }); };
  const fire = (x, y, o) => ent('oilfire', x, y, o || {});
  const skin = (x, y) => ent('stray', x, y, { kind: 'waterskin' });
  /* A MARKET AWNING standing on the floor under (x, y): the prop, and the shade it casts (the same box src/sunstroke.js shadeZones gives an
     awning: its canvas is 52 px wide, centred on the tile) */
  const awn = (x, y, torn) => { ent('deco', x, y, { kind: torn ? 'awningTorn' : 'awning' }); const left = x * TS + 8 - 26, g = (y + 1) * TS, A = SHADE_OF.awning;
    cast.push([left + A.x0, left + A.x1, g - A.h, g + 1]); };
  /* THE SHADE'S CASTERS (claude/welltown5, Daniel played it 10-03: "some sections where it's not clear that things will actually give you shade"): every
     tinted shade sits UNDER a thing drawn overhead - an awning (above), the tiles of a roof, a lintel, a balcony, a parapet or a vault, or one of these:
     A CLOTH CANOPY strung on a rope over columns x0..x1, its cloth at row `row`, over the floor row `floor` (src/redraw/welltown_props.js drawCaster), and
     its shade from the cloth down; or A WELL-HOUSE ROOF on two posts. tools/welltown.mjs THE SHADE HAS A CASTER holds both ways */
  const casters = [];
  const canopy = (x0, x1, row, floor, o = {}) => { casters.push({ kind: 'cloth', x0: x0 * TS, x1: (x1 + 1) * TS, y: row * TS, yb: row * TS + 12, floor: floor * TS, ...o }); shade.push([x0 * TS, (x1 + 1) * TS, row * TS + 10, floor * TS + 1]); };
  const wellRoof = (x0, x1, row, floor) => { casters.push({ kind: 'roof', x0: x0 * TS, x1: (x1 + 1) * TS, y: row * TS, yb: row * TS + 9, floor: floor * TS }); shade.push([x0 * TS, (x1 + 1) * TS, row * TS + 9, floor * TS + 1]); };

  // ================= 1. THE CARAVAN GATE (0-63) =================
  ground(0, 15, S);
  block(0, 1, 0, H - 1);
  sign(6, S - 1, 'THE WELL TOWN. FILL YOUR SKIN AT A WELL. POUR IT ON MUD.');
  well(11, S - 1);                                                            /* THE FIRST WELL: out in the sun, before anything asks for water */
  mudDoor(14, 14, 18, S);                                                     /* THE FIRST LESSON (claude/welltown3, WELL CLARITY): a postern in the town's outer wall, bricked with mud, three steps from the first well
                                                                                 and out of every bowman's sight - fill, then pour, with nothing watching (required: the only way in) */
  set(16, S - 1, SLOPE.R2A); set(17, S - 1, SLOPE.R2B); ground(18, 25, S - 1);   /* a dune ramp up to the gate */
  set(26, S - 2, SLOPE.R2A); set(27, S - 2, SLOPE.R2B); ground(28, 43, S - 2);
  /* THE GATEHOUSE: the town wall's mass over a passage three rows high (its shade), bowmen on its top, a ladder up its town face */
  block(29, 41, 19, 24);                                                      /* (its top two rows lower than the greybox's: a bowman on it sees the street, 144 px down) */
  bowman(32, 18, 'gatehouse'); bowman(37, 18, 'gatehouse');
  ladder(42, 19, 27);
  /* THE MUD HOUSE: a little house across the street, its door bricked with mud and a water-skin inside - the pour taught where it costs nothing
     (the street goes up its steps and over its roof) */
  ground(44, 63, S);
  block(44, 45, S - 2, S - 1);                                                /* its steps */
  block(46, 53, S - 4, S - 1); air(47, 52, S - 3, S - 1);                     /* the house, and its room */
  mudWalls.push({ x0: 46, x1: 46, y0: S - 3, y1: S - 1, optional: true }); ent('mudwall', 46, S - 1, { x1: 46, optional: true });
  skin(50, S - 1);                                                            /* WATER-SKIN ONE */
  interiors.push([47, 52, S - 3, S - 1, 'wtHouse']);
  foe('cutthroat', 44, S - 3, 'gate'); thief(45, S - 3, 'gate');            /* (claude/desertfoes: a knife and a thief - the skin's cut is met where the first well can mend it) */
  awn(43, S - 3, true);                                                      /* their awning at the foot of the gatehouse ladder: the gate's fight is not the sun's (the first well, out in the open, teaches the sun) */   /* the gate's two knives, ON THE HOUSE'S STEPS: the optional pour is taught with them watching (its sip refills at 77) */

  // ================= 2. THE LOWER MARKET (64-149) =================
  ground(64, 89, S);
  for (const x of [65, 68, 71, 74]) awn(x, S - 1, x % 2 === 0);              /* the stalls' awnings, a row of them (claude/welltown5: the shade is theirs, under them - no tinted box over them any more) */
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
  fireScorp(103, S - 1, 'bazaar'); thief(107, S - 1, 'bazaar');             /* (claude/desertfoes) a FIRE SCORPION under the bazaar roof by the stall fire: the pour, developed - its patch is a fire you made it make */
  fire(121, S - 1, { stall: true });                                         /* THE STALL FIRE: under the roof, across the way */
  bowman(110, 22, 'bazaarRoof'); bowman(117, 22, 'bazaarRoof');
  ent('silver', 128, 22);                                                     /* SILVER ONE: on the roof walk, in the sun */
  /* up to the square: the market stair */
  ground(132, 137, S); ground(138, 143, S - 2); ground(144, 149, S - 4);
  awn(140, S - 3, true);                                                     /* a torn stall awning on the stair: shade between the bazaar and the square */

  // ================= 3. THE WELL SQUARE (150-205) and THE GREAT WELL =================
  ent('check', 147, S - 5);                                                    /* CHECKPOINT: THE SQUARE'S DOOR, at the head of the market stair (claude/welltown-polish): the Gang Leader's courtyard is the next 40 tiles - a death must not send you back through the bazaar */
  const Q = S - 4;                                                            /* the square's floor row: 26 */
  ground(150, 192, Q);
  /* THE MARKET COURTYARD (claude/welltown-polish, Daniel 10-02): THE GANG LEADER's - the square at the head of the market stair, forty tiles from 152,
     his wall shut behind you at 151 and the fallen street's rubble shut at 192 (src/gang-leader.js stageGangLeader). The well-house, its bowman and the square's knives went
     to the Kasbah's courtyard (7, below): the square is his, and the way on (THE GREAT WELL's windlass, in the middle of it) is fouled until he falls */
  /* THE GREAT WELL: a shaft two wide from the square to the cistern's floor, its WINDLASS on the west lip (strike it: the brake comes off and the
     bucket runs down - with you on it), the well head on the east lip (fill there). The bucket is a lift that moves only on the windlass */
  const gx = 176, floorC = 40;
  air(gx, gx + 1, Q, floorC);
  ent('windlass', gx - 1, Q - 1, { bucket: 'great', top: true });
  well(gx + 3, Q - 1, { great: true, arena: true });                         /* (the courtyard's well, in the Gang Leader's reach: the skin is filled mid-fight) */
  moversExtra.push({ kind: 'lift', windlass: 'great', x: gx * TS, y: Q * TS, y0: Q * TS, y1: floorC * TS, w: 32, h: 8, speed: 0, locked: true });
  /* THE RUBBLE: the street east of the square fell into the cisterns - a heap twelve rows high, no way over */
  block(193, 197, 13, Q - 1); ground(193, 197, 13);
  sign(190, Q - 1, 'THE STREET IS DOWN.');
  const gang = stageGangLeader({ set, block, ent, air }, T, TS, 152, Q);
  canopy(151, 192, Q - 6, Q);                                                 /* the market's CLOTHS strung across the square on a rope, wall to wall (claude/welltown5: drawn, and the shade is under them): his fight is not the sun's */
  for (const x of [156, 166, 184]) awn(x, Q - 1, x === 166);

  // ================= 4. THE CISTERNS (166-258, rows 34-40, under the square and the mud quarter) =================
  const C0 = 166, C1 = 258;
  ground(198, 325, S);                                                        /* the mud quarter's street over the cisterns' east end (its west end: behind the rubble) */
  air(C0, C1, 34, 39);                                                        /* the hall: six rows */
  /* THE CHOICE UNDER THE STREET (the concept: "cut through the scorpions or go round under the pillars"): from 197 the vault is raised three
     rows and a gallery runs over the pillars' caps (a ladder up at 197, a drop at 238) - the ROUND way, past the sump's squad, with water-skin
     two at its end; the floor under it is the QUICK way, through them. Both meet THE OLD STINGER at the gate */
  air(197, 238, 31, 33); boards(198, 237, 34); ladder(197, 31, 39);
  for (let x = 188; x < 248; x += 12) block(x, x, 34, 35);                   /* the pillars, hung from the vault: the floor passes under them, the gallery over their caps */
  shade.push([C0 * TS, (C1 + 1) * TS, 31 * TS, 40 * TS + 1]);
  interiors.push([C0, C1, 34, 39, 'wtCistern'], [197, 238, 31, 33, 'wtCistern']);
  well(gx + 5, 39, { cistern: true });                                        /* THE CISTERN'S OWN WELL: the water at the bucket's foot */
  ent('windlass', gx + 2, 39, { bucket: 'great', top: false });              /* the bucket's foot: the bottom windlass winds it back up */
  ent('check', 194, 39);                                                      /* CHECKPOINT TWO: past the cistern's well, at the foot of the gallery's ladder (earned: the well's scorpions are behind it) */
  skin(234, 33);                                                              /* WATER-SKIN TWO: at the end of the gallery (the round way pays) */
  foe('scorpion', 206, 33, 'gallery'); venomScorp(213, 33, 'gallery');  /* (claude/welltown3) the round way is not free: two of the Queen's brood on the pillar caps */
  foe('scorpion', 183, 39, 'cistern'); foe('scorpion', 186, 39, 'cistern');  /* THE CISTERN'S OWN WELL IS HELD: the refill at the bucket's foot is a fight */
  thief(218, 39, 'sump'); venomScorp(222, 39, 'sump');                       /* (claude/desertfoes) THE VENOM SCORPIONS: the Queen's brood in her cisterns (one on the gallery, one at the sump) */
  /* THE OLD STINGER: the cistern's elite holds the gate in front of the rungs up (eliteGates: it opens when he dies) */
  ent('scorpion', 244, 39, { face: -1, elite: true, gate: 251 });
  /* the rungs up into the mud quarter: a shaft through the street */
  air(255, 256, S, 33); ladder(255, S, 39); ladder(256, S, 39);
  skin(205, S - 1);                                                           /* WATER-SKIN THREE: on the dead street behind the rubble (west of the rungs: a dead end) */

  // ================= 5. THE MUD QUARTER (259-325) =================
  mudDoor(262, 263, 17, S);                                                   /* MUD WALL ONE: the first lane, bricked */
  foe('cutthroat', 264, S - 1, 'wallOne'); fireScorp(266, S - 1, 'wallOne');   /* (claude/desertfoes: a knife and a fire scorpion) */   /* behind it, in their awning's shade: the pour opens onto them */
  awn(265, S - 1);
  ground(268, 277, S - 2); boards(270, 275, 24);                              /* a step up, and a balcony over it */
  bowman(272, 23, 'balcony');
  shade.push([270 * TS, 276 * TS, 25 * TS, (S - 2) * TS + 1]);
  well(283, S - 1);                                                           /* THE MUD QUARTER'S WELL, held (its thieves under the well's stall awnings) */
  thief(287, S - 1, 'well2'); thief(290, S - 1, 'well2');
  awn(286, S - 1); awn(290, S - 1, true);
  mudDoor(296, 297, 17, S);                                                   /* MUD WALL TWO: the second lane */
  ground(300, 305, S - 2); ground(306, 311, S);
  awn(303, S - 3);                                                            /* (the lane's pair stands behind MUD WALL ONE now: the review's fix 8) */
  /* THE DOVECOTE: a tower, rungs up its middle, a door through its foot, a window on its east face at the roofs' height, a hatch in its roof (and a
     silver on top: a dead end up) */
  { const x = 320; block(x, x + 4, 11, S - 1); air(x + 1, x + 3, 12, S - 1); air(x, x, S - 3, S - 1); ladder(x + 2, 11, S - 1);
    air(x + 4, x + 4, 15, 17); set(x + 3, 18, T.ONEWAY); block(x, x + 4, 11, 11); set(x + 2, 11, T.NET);   /* the window, and a sill off the ladder to it */
    ent('silver', x + 2, 8); interiors.push([x + 1, x + 3, 12, S - 1, 'wtDovecote']);
    shade.push([(x + 1) * TS, (x + 4) * TS, 12 * TS, S * TS + 1]); }                   /* the tower is a building: its inside is shade, the breather before the roost */

  // ================= 6. THE BANDITS' ROOST (326-425): rooftops in the open sun =================
  /* the houses stand solid from their roofs down to the street; the alleys between them drop to the street, a ladder in each */
  ground(326, 425, S);
  const house = (x0, x1, roof) => block(x0, x1, roof, S - 1);
  house(325, 336, 18);
  ent('check', 326, 17);                                                      /* CHECKPOINT THREE: on roof A, outside the dovecote's window (the gaps even out: the review's fix 12) */
  awn(331, 17);
  ladder(337, 18, S - 1);
  house(340, 350, 20); boards(345, 349, 15); ladder(347, 15, 19);          /* a perch on a pole over house B's roof: the bowman's */
  bowman(347, 14, 'perch1');
  foe('cutthroat', 342, 19, 'roofB'); vulture(344, 19, 'roofB'); awn(342, 19);   /* (claude/desertfoes: his knife, and a VULTURE wheeling over roof B - in the open sun its shadow is shade, and its dive the price of standing in it) */   /* roof B's pair holds its awning */
  ladder(353, 17, S - 1);
  house(354, 366, 17);
  thief(360, 16, 'roofC'); awn(360, 16, true);
  well(364, 16, { jar: true, sips: 1 });                                      /* A WATER JAR on roof C: ONE sip (not a well - the roost's twist stays a choice), for the sip his cut takes (tools/welltown.mjs THE WATER BUDGET) */
  /* THE BURNING BARRICADE: house D's roof walk runs under the parapet (two rows high) and the bandits have set it alight. No way over the parapet,
     none under the house: pour it out */
  house(367, 384, 19); block(372, 384, 8, 16);
  fire(376, 18, { barricade: true });
  boards(367, 370, 15); ladder(368, 15, 18); bowman(368, 14, 'perch2');        /* A SECOND PERCH, on a pole at house D's west end: the barricade is poured under his arrows */
  shade.push([372 * TS, 385 * TS, 17 * TS, 19 * TS + 1]);
  ladder(387, 19, S - 1);
  house(388, 400, 21);
  fireScorp(392, 20, 'roofE'); vulture(395, 20, 'roofE'); awn(393, 20);   /* (claude/desertfoes: a fire scorpion on roof E and a vulture over it, past the barricade - the skin's last sips are fire or sun) */   /* roof E's pair holds its awning */
  house(401, 420, 24); boards(401, 405, 18);                                  /* a lower terrace, and a chimney ledge over it (a hop up from house E) */
  skin(404, 17);                                                              /* WATER-SKIN FOUR: up on the chimney ledge */
  thief(413, 23, 'terrace'); bowman(418, 23, 'terrace'); awn(413, 23, true);
  ground(421, 425, 26);   awn(424, 25, true);   /* (claude/ksar2) THE SUN v2: the rule walk is 4 s now - a torn awning on the step down to the Kasbah street */

  // ================= 7. THE KASBAH (426-521): the exam, the dry cistern, the courtyard =================
  const K = 28;                                                               /* the Kasbah street's floor row */
  ground(426, 472, K);
  awn(437, K - 1);                                                            /* the Kasbah street's one awning, over the dry cistern's hole */
  /* THE DRY CISTERN: under the street, down a hole by its own ladder. Pour the four water-skins in (INTERACT at it): it fills and THE VAULT opens */
  air(431, 446, K + 1, K + 4); block(431, 446, K + 5, H - 1); air(431, 431, K, K); ladder(431, K, K + 4);
  ent('cistern', 437, K + 4);
  block(441, 441, K + 1, K + 4); vaultDoors.push({ x0: 441, x1: 441, y0: K + 1, y1: K + 4 });
  for (const x of [442, 443, 444]) ent('coin', x, K + 4); ent('silver', 445, K + 4);   /* the vault: SILVER THREE and a purse of coins */
  interiors.push([431, 446, K + 1, K + 4, 'wtCistern']);
  /* THE EXAM: the last well, held by thieves and a bowman over it; then the Kasbah's bricked door and, behind it, a fire under the gateway's
     lintel - two pours, a three-sip skin, the sun and a bowman */
  well(448, K - 1, { deep: true });                                           /* A DEEP WELL: its bucket is down - strike its windlass and wind it up (2 s), under the bowman and the thieves, before you can fill */
  ent('windlass', 446, K - 1, { deep: true });
  awn(450, K - 1, true);                                                      /* the well's torn awning: the wind is a fight under arrows, not a death by sun (the walk to it is the sun's) */
  boards(450, 454, 22); ladder(449, 22, K - 1);
  bowman(452, 21, 'kasbahLedge');
  thief(451, K - 1, 'kasbahWell'); thief(455, K - 1, 'kasbahWell');
  mudDoor(458, 459, 12, K);                                                   /* MUD WALL THREE: the Kasbah's door */
  block(460, 468, 22, 24);                                                    /* the gateway's lintel: a passage three rows high */
  fire(464, K - 1, { gateway: true });                                        /* and a fire in it */
  shade.push([460 * TS, 469 * TS, 25 * TS, K * TS + 1]);
  ent('check', 470, K - 1);                                                   /* CHECKPOINT FOUR: the courtyard door */
  /* THE KASBAH'S COURTYARD: the garrison's last stand (it was the Gang Leader's; he is in the market now - claude/welltown-polish). Two gateways in the
     Kasbah's walls (473 and 514, a passage six rows high), a pair of knives and a thief holding the yard, a bowman on each of two ledges. The route
     is the floor; a ledge is a fight from above that a pour does not reach, so the skin is for the well, not the wall */
  ground(473, W - 1, K);
  block(473, 473, K - 16, K - 7); block(514, 514, K - 16, K - 7);             /* the gateways' walls (they were the mini's door and gate) */
  canopy(473, 514, K - 5, K, { v: 1 });                                       /* the garrison's cloths strung over the yard from wall to wall under its galleries, low enough to be seen (claude/welltown5: it was a tint with nothing over it) */
  boards(480, 485, K - 6); ladder(479, K - 6, K - 1); bowman(483, K - 7, 'kasbahArch');   /* a gallery on the west wall, over the gateway's lintel */
  foe('cutthroat', 490, K - 1, 'court'); foe('cutthroat', 496, K - 1, 'court'); thief(500, K - 1, 'court'); awn(493, K - 1, true);   /* the knives hold the yard under its awning (the exam's last well is behind you: no refill here, the old well's skin comes full) */
  boards(504, 509, K - 6); ladder(510, K - 6, K - 1); bowman(507, K - 7, 'kasbahArch2');   /* and a second gallery over the east gateway */
  /* THE OLD WELL: at the courtyard's end, the Kasbah's own well, dry - its shaft is the way down into THE BINDING WORKS (claude/djinn2, below). The
     Kasbah's back wall shuts the street there */
  sign(517, K - 1, 'THE OLD WELL. SOMETHING IS BOUND AT THE BOTTOM.');
  foe('scorpion', 512, K - 1, 'oldwell'); foe('scorpion', 515, K - 1, 'oldwell');   /* (the desert's scorpions, up out of the dry shaft onto the street) the old well's mouth is held */
  block(523, 527, 4, K - 1);                                                  /* THE KASBAH'S BACK WALL: the street ends at the old well */
  air(520, 521, K, 35); ladder(520, K, 35);                                   /* THE OLD WELL's shaft, a rope down it */
  interiors.push([520, 521, K + 1, 30, 'wtQueen']);
  /* ================= 8. THE BINDING WORKS (514-607, rows 29-56): the descent to him (claude/djinn2, Daniel 10-03: "so he doesn't come from nowhere") =================
     The old cistern works under the Kasbah - dry channels, a sluice, a conduit - and the BINDING SEALS carved on their walls, brighter the deeper you
     go (L.seals: src/well-town-hands.js draws them, src/redraw/djinn_art.js drawSeal); sand trickles from cracks in the vault (L.cracks) and the ground
     shakes, more often as you go down (L.works). The BANDIT MYSTICS (src/bandit-mystic.js: the goblin mage's AI under men's skins - casters, and
     LAMP-BEARERS whose warding light halves your blows) chant at the seals to free him. No sun down here: all shade.
       THE WELL'S FOOT (514-531)   the shaft's foot, the old well's LAST WATER (fill here), the first seal, dim
       THE DRY CHANNEL (532-559)   TEACH: a lamp-bearer warding a knife in the channel's trough - pour on the lamp, or kill him and take it
       THE SLUICE (560-577)        the sluice chamber, down ledge by ledge (each hero's plain jump and drop), casters on the ledges, the second seal; a
                                   drip-spring at its foot (claude/djinn3)
       THE STEAM WORKS (578-617)   (claude/djinn3) TEACH the vents in a corridor (time them, or pour on one: capped); THE FLOODED TROUGH, steam vents under
                                   the water (time it); THE BELLOWS VENT in a low tunnel - it never stops: cap it, and a FIRE SPIRIT past it (douse it)
       THE CONDUIT (618-629)       REMIX: down the conduit's steps into a bearer warding casters; throw his lamp at them
       THE SEAL HALL (630-646)     EXAM: the last mystics chanting at the brightest seals by his door, a spring; the checkpoint at the door
     THE LESSER DJINN (claude/djinn3: src/lesser-djinn.js - the will-o'-the-wisp's AI under his skins): SAND SPIRITS a blade passes through until a pour makes
     them MUD (the dry channel, the sluice), FIRE SPIRITS that turn a blade until a pour DOUSES them (the steam works, the seal hall) - his two verbs, small.
     At the bottom THE LAST SEAL, on his hall's back wall, breaks when you come in (src/djinn-hands.js: told, cutscene-lite) and he rises. */
  const mystic = (x, y, squad) => foe('gobmage', x, y, squad, { cnSkin: 'banditmystic' });
  const bearer = (x, y, squad) => foe('gobmage', x, y, squad, { cnSkin: 'lampbearer' });
  const sandSpirit = (x, y, squad) => foe('willowisp', x, y, squad, { cnSkin: 'sanddjinn' });   /* (claude/djinn3) THE LESSER DJINN: a blade passes through until a pour makes him mud */
  const fireSpirit = (x, y, squad) => foe('willowisp', x, y, squad, { cnSkin: 'firedjinn' });   /* (claude/djinn3) a blade is turned until a pour douses him */
  const vent = (x, y, o) => ent('flamevent', x, y, o);   /* (claude/djinn3) A FLAME VENT standing on row y: { h rows of jet, period, phase, always, steam, w } */
  const DX = 40;   /* (claude/djinn3) everything from the conduit on moved 40 columns east for THE STEAM WORKS */
  const seals = [], cracks = [];
  const seal = (x, y, glow) => seals.push({ x: x * TS + 8, y: y * TS + 8, glow });
  /* THE WELL'S FOOT and THE DRY CHANNEL: a tunnel five rows high, a trough in the channel's bed, the vault's ribs hanging */
  air(514, 559, 31, 35);
  air(538, 550, 36, 37); air(551, 551, 36, 36);                               /* the channel's trough (two rows down), a step out of it */
  for (const x of [530, 544, 556]) block(x, x, 31, 31);                       /* the vault's ribs */
  well(516, 35, { lastWater: true, works: true });                                         /* THE OLD WELL'S LAST WATER: fill your skin before the works */
  sign(518, 35, 'THE BINDING WORKS. THE SEALS HOLD IT DOWN.');
  seal(526, 33, 0.3);
  bearer(548, 37, 'channel'); foe('cutthroat', 544, 37, 'channel');          /* TEACH: a knife in the lamp's light (half a blow on him) and the bearer behind him */
  sandSpirit(534, 33, 'footSpirit');                                          /* (claude/djinn3) THE FIRST SAND SPIRIT, alone at the well's foot by its last water: a blade passes through - pour, and cut the mud */
  cracks.push([535, 31], [553, 31]);
  interiors.push([514, 559, 31, 35, 'wtQueen'], [538, 551, 36, 37, 'wtQueen']);
  /* THE SLUICE: a chamber seventeen rows deep, down three ledges (two-row and three-row drops) to its floor */
  air(560, 577, 31, 47);
  boards(560, 566, 38); boards(570, 577, 41); boards(561, 567, 44);
  mystic(573, 40, 'sluiceLedge'); venomScorp(566, 47, 'sluice');                  /* a caster on the middle ledge, the Queen's brood on the floor */
  sandSpirit(563, 36, 'sluiceSpirit');                                        /* (claude/djinn3) a sand spirit over the sluice's top ledge, under the caster's bolts */
  well(575, 47, { sluiceSpring: true, works: true });                         /* (claude/djinn3) THE SLUICE'S DRIP-SPRING at its foot: the skin full for the steam works */
  seal(569, 34, 0.55);
  cracks.push([563, 31], [575, 31], [571, 31]);
  interiors.push([560, 577, 31, 47, 'wtQueen']);
  /* ================= THE STEAM WORKS (578-617, claude/djinn3): the vents, the flooded trough, the bellows ================= */
  /* TEACH: a corridor six rows high off the sluice's floor (row 48), two vents on a slow rhythm, out of turn - wait for the jet to die, or pour on one */
  air(578, 591, 42, 47);
  sign(580, 47, 'FLAME VENTS. POUR ON ONE TO CAP IT.');
  vent(584, 47, { h: 5, period: 3.6, phase: 0 }); vent(588, 47, { h: 5, period: 3.6, phase: 1.8 });
  mystic(591, 47, 'ventCaster');                                              /* (a caster at the corridor's end: the vents are fought through, not just walked) */
  /* THE FLOODED TROUGH: the floor drops into standing water (rows 48-49 over a floor at 50); vents under it blow STEAM on their rhythm - bubbles, then a
     scalding column. Nothing caps a vent under water: time it */
  air(592, 603, 42, 49); block(592, 592, 49, 49); block(603, 603, 49, 49);    /* a step down into it, a step up out of it */
  vent(595, 49, { h: 6, period: 3.0, phase: 0.4, steam: true }); vent(600, 49, { h: 6, period: 3.0, phase: 1.9, steam: true });
  wtPools.push({ x0: 593 * TS, x1: 603 * TS, top: 48 * TS, floor: 50 * TS });
  /* THE BELLOWS: a low tunnel three rows high (no way over: the works' stone over it), a vent on its rhythm, then THE BELLOWS VENT that never stops - two
     tiles of fire wall to roof. A pour caps it: go while it is capped. Past it, a FIRE SPIRIT: douse it, then cut it */
  air(604, 617, 45, 47);
  vent(607, 47, { h: 3, period: 3.2, phase: 0.8 });
  vent(611, 47, { h: 3, always: true, w: 2 });
  fireSpirit(615, 46, 'bellowsSpirit');
  seal(598, 44, 0.65);
  cracks.push([582, 42], [589, 42], [597, 42], [602, 42]);
  interiors.push([578, 591, 42, 47, 'wtQueen'], [592, 603, 42, 49, 'wtQueen'], [604, 617, 45, 47, 'wtQueen']);
  /* THE CONDUIT: down its steps from the steam works' floor to the hall's (rows 48 -> 56), its roof at row 44 */
  { const F2 = [49, 49, 50, 50, 51, 51, 52, 53, 54, 54, 55, 56]; for (let i = 0; i < F2.length; i++) { const x = 578 + DX + i; air(x, x, 44, F2[i] - 1); block(x, x, F2[i], H - 1); } }
  bearer(581 + DX, 49, 'conduitTop'); mystic(587 + DX, 53, 'conduitLow'); foe('cutthroat', 584 + DX, 51, 'conduit');   /* REMIX: the bearer above, his light over a caster and a knife on the steps below */
  cracks.push([583 + DX, 44]);
  interiors.push([578 + DX, 589 + DX, 44, 55, 'wtQueen']);
  /* THE SEAL HALL: the last mystics chant at the brightest seals by his door; a spring; the checkpoint at the door */
  air(590 + DX, 606 + DX, 44, 55);
  well(592 + DX, 55, { sealSpring: true, works: true });
  mystic(597 + DX, 55, 'sealhall'); bearer(601 + DX, 55, 'sealhall'); mystic(599 + DX, 51, 'sealhallStep'); boards(597 + DX, 601 + DX, 52);   /* EXAM: two casters (one on a step over the floor) and the bearer between them */
  fireSpirit(604 + DX, 50, 'sealhallSpirit');                                 /* (claude/djinn3) and a fire spirit at the door: his fire, small, before his fire */
  seal(595 + DX, 48, 0.8); seal(603 + DX, 47, 1.0);
  cracks.push([593 + DX, 44], [600 + DX, 44], [605 + DX, 44]);
  ent('check', 605 + DX, 55);                                                 /* CHECKPOINT FIVE: the sealed door, the boss's door (a death in his hall is not the descent again) */
  interiors.push([590 + DX, 606 + DX, 44, 55, 'wtQueen']);
  shade.push([514 * TS, 520 * TS, 29 * TS, 57 * TS + 1], [522 * TS, (608 + DX) * TS, 29 * TS, 57 * TS + 1]);   /* (underground: no sun - but down the old well's open shaft, the sky) */
  const QF = 56;                                                              /* the hall's floor row */
  const queen = stageDjinn({ set, block, ent, air }, T, TS, 608 + DX, QF, K + 3, { westDoor: 3 });   /* THE GREAT WELL's deep cistern: THE DJINN's hall, its door off the seal hall (its shaft capped under the street) */
  for (const n of queen.ladders) nets.push(n);
  shade.push([(608 + DX) * TS, (648 + DX) * TS, (K + 1) * TS, (QF + 2) * TS + 1]);
  interiors.push([608 + DX, 647 + DX, QF - 15, QF - 1, 'wtQueen'], [625 + DX, 630 + DX, QF, QF + 1, 'wtQueen']);   /* (and the sump under the shaft) */
  /* THE WAY OUT: his east wall opens when he falls (the arena's own wall) onto the cistern's old outflow, and the road out of town */
  air(649 + DX, 659 + DX, QF - 6, QF - 1);
  ent('gate', 656 + DX, QF - 1);
  block(W - 2, W - 1, 0, H - 1);
  // ================= THE LADDERS, LAST =================
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  const START = { x: 3, y: S - 1 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra, interiors,
    arena: queen.arena, mini: gang.mini, gateAfterBoss: true,
    welltown: true,
    mudWalls, vaultDoors,
    shade: [...shade, ...cast], shadeArt: shade.slice(),   /* (an awning paints its own shade: only the rest is tinted) */
    casters,                                               /* the cloths and the well-house roof over the tinted shade (src/well-town-hands.js drawWorld draws them) */
    seals, cracks: cracks.map(([x, y]) => ({ x: x * TS + 8, y: y * TS + 16 })), works: { x0: 514, x1: 647, y0: 29, y1: 56 },   /* (claude/djinn2) THE BINDING WORKS: its seals, the cracks sand trickles from, the zone the ground shakes in (src/well-town-hands.js) */
    wtPools,                                                                                     /* (claude/djinn3) THE STEAM WORKS' flooded trough: standing water, drawn (src/well-town-hands.js) */
    quest: { n: 4, item: 'waterskin', name: 'WATER-SKINS', done: 'FOUR SKINS: POUR THEM IN THE DRY CISTERN', thanks: 'THE CISTERN IS FULL' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,                  /* four checkpoints (Daniel: fewer); src/level.js checkpoints() must not fill between them */
    /* WHAT EACH THING OPENS, and the line that says so (tools/level-quality.mjs `unlocks`; the lines are src/hint-lines.js callouts the hands say) */
    unlocks: [
      { kind: 'stray', opens: 'THE DRY CISTERN\'s vault (the third silver and its coins) once all four are poured in', hud: 'WATER-SKINS n/4 (the quest counter); at the cistern: POUR THE SKINS IN: THE VAULT OPENS' },
      { kind: 'skinwell', opens: 'your skin: three sips to pour or drink', hud: 'YOUR SKIN IS FULL: E POURS, E DRINKS' },
      { kind: 'mudwall', opens: 'the lane it bricks (a pour)', hud: 'MUD: POUR YOUR SKIN ON IT' },
      { kind: 'oilfire', opens: 'the way it burns across (a pour)', hud: 'THE FIRE IS OUT - GO' },
      { kind: 'windlass', opens: 'the bucket down THE GREAT WELL into the cisterns (and back up)', hud: 'STRIKE THE WINDLASS: THE BUCKET GOES DOWN' },
      { kind: 'flamevent', opens: 'the way past it while it is capped (a pour; THE BELLOWS never stops until it is)', hud: 'CAPPED: THE VENT HISSES, AND HOLDS' },
      { kind: 'cistern', opens: 'THE DRY CISTERN\'s vault: the third silver and its coins', hud: 'THE CISTERN FILLS: THE VAULT OPENS' },
    ],
    music: 'welltown',   /* Daniel's pick (10-02): "Desert Calmness and Fighting (Orchestral)" by Dizzy Crow, CC0 - the calm intro once, then its loop (audio/welltown.ogg, src/audio.js TRACK_INTRO) */
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    sun: true, caravan: true,   /* THE SUN (src/sunstroke.js) and the desert's hands in main.js (the sun meter, the shade, the sand and stone skins, the bandits' AI) */
    ledgeKit: 'desert',
    palette: { set: 'desert', near: 'none', dress: 'desert', noFg: true, noNear: true, haze: 'rgba(236,206,160,0.10)' },
    duskStart: -1, duskLen: 1,
  };
}
