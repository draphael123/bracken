// src/ksar.js - THE BANDIT KSAR, desert act, main road past THE GLASS SEA (claude/ksar, the OPUS GREYBOX, 2026-10-07: geometry, the gong rule, the
// encounters, the wiring; greybox art only - no art pass until the review). Brief: .claude/briefs/brief-banditksar.md (from Daniel's approved
// concept, interview 10-07: every rec kept). Main road: glasssea > KSAR (> the Buried City, not built yet: it will need 'ksar').
//
// THE RULE: THE FORT ANSWERS ITS GONGS: A RUNG GONG CALLS EVERY BANDIT IN EARSHOT, AND A CUT ROPE SILENCES IT.
// A GONG hangs by a ROPE from its frame. While it hangs it can be RUNG - by a bandit who reaches it (a LOOKOUT who has seen you, a PLANTED SENTRY on
// the alarm) or by you (E). A rung gong CALLS every fort bandit in its EARSHOT (drawn: noise rings out to it): each leaves his post - a guard post, a
// bed in a guard hut, the gatehouse - runs to the gong, musters there and walks back. A blade on its rope CUTS it: the disc falls and lies silent for
// good (a respawn keeps it cut). src/ksar-hands.js is the rule's code; tools/ksar.mjs holds this header's rule line equal to LEVELS' and checks it.
// THE THIRD VERB, THROW (src/carry-throw.js kinds 'keg' and 'flask'; E takes one from a stack, ATTACK throws it in the told arc): a POWDER KEG blasts
// where it lands (a fizzing fuse first, its ring drawn) - foes, BARRICADES (bricked-up arches, drawn cracked) and any keg in reach (a CHAIN); a set keg
// is KICKED (any blow) where it stands. A FLASH FLASK breaks in a white flash: a hawk is blinded, bandits stunned, and a puff of smoke is left.
//
// THE THEMED KEY: five stolen CARAVAN SEALS (L.quest). With all five THE STRONGROOM's door (by the courtyard) opens: a silver (no relic).
//
// SEVEN SECTIONS (columns; the road's surface is row 34, the wall walk's 28):
//   0-71     THE CARAVAN ROAD      TEACH    the first screen climbs the wadi bank; THE FIRST GONG by a sleeping lookout (cut its rope - or ring it and the
//                                           guard hut's sleepers come); a keg stack and THE BRICKED ARCH under the wall (a seal: THROW taught safe)
//   72-231   THE OUTER WALLS       TEST     the wall walk: a LOOKOUT runs for his gong if he sees you (cut it first, or slip by in the SMOKE THROWER's
//                                           smoke); a HAWK SCOUT patrols (it shrieks: the lookouts run); a SHIELD SENTRY planted at the third gong
//   232-272  THE GATE WINCH        SET PIECE ONE (REQUIRED RING): THE GREAT GONG on its tower; the gatehouse squad holds the winch's BRAKE from its
//                                           guard room (behind the grille): ring the great gong, they run to it, haul the portcullis notch by notch
//   273-357  THE SOUQ YARD         REMIX    ring the souq gong to draw the stair's squad under the roof; a keg from the roof onto them
//   358-445  THE POWDER STORE      SET PIECE TWO (REQUIRED THROW): kick the first keg - the chain runs across the roof to THE BRICKED ARCH over the
//                                           only way up (its fuse-line and rings drawn first); the store's roof is holed into its cellar (a seal)
//   446-583  THE HAWK TOWER ROOFS  EXAM     three gongs, two lookouts, a planted sentry, two hawk scouts, slingers, the roof squad on the way down
//   584-623  THE COURTYARD         BOSS     THE HAWK-MISTRESS (src/hawk-mistress.js stageHawkMistress)
import { stageHawkMistress, HM_STAGE } from './hawk-mistress.js';

export const KSAR = { W: 628, H: 46, base: 34, wall: 28 };
export const SECTIONS = [['THE CARAVAN ROAD', 0], ['THE OUTER WALLS', 72], ['THE GATE WINCH', 232], ['THE SOUQ YARD', 273], ['THE POWDER STORE', 358], ['THE HAWK TOWER ROOFS', 446], ['THE COURTYARD', 584]];
export const RULE = 'THE FORT ANSWERS ITS GONGS: A RUNG GONG CALLS EVERY BANDIT IN EARSHOT, AND A CUT ROPE SILENCES IT.';
/* each verb's arc (tile columns) - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/ksar.mjs */
export const ARCS = {
  cut: { teach: [28, 40], test: [126, 145], remix: [360, 382], exam: [462, 570] },          /* the sleeping lookout's gong; under the lookout's eye; the terrace's runner; the roofs */
  ring: { teach: [28, 52], test: [232, 272], remix: [300, 330], exam: [462, 570], boss: [584, 623] },   /* the hut's sleepers; THE GATE WINCH (required); the souq's squad; the roof squad; the hawk */
  throw: { teach: [56, 80], test: [300, 330], remix: [392, 446], exam: [540, 576], boss: [584, 623] }, /* the bricked arch; a keg on the squad; THE POWDER STORE (required); the roof squad; the flasks */
};

export function buildKsar({ painter, T, TS }) {
  const { W, H, base: B, wall: WW } = KSAR;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const boards = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const ground = (x0, x1, top) => block(x0, x1, top, H - 1);
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ face: -1, squad }, o || {}));
  /* THE CAST (every one a proven machine under a skin but the hawk scout; src/ksar-hands.js gives each its twist - and EVERY fort bandit answers the gongs):
     ks: the role in the gong rule - post (stands, answers calls), lookout (runs for his gong when he sees you), planted (holds his gong, rings it on the
     alarm), reserve (asleep in a guard hut until a gong in earshot rings), gatehouse (in the guard room: holds the winch's brake) */
  const blade = (x, y, squad, o) => foe('cutthroat', x, y, squad, Object.assign({ cnSkin: 'ksarblade', ks: 'post' }, o || {}));                  /* THE GANG LEADER's DUELISTS: curved swords */
  const lookout = (x, y, squad, gong, o) => foe('cutthroat', x, y, squad, Object.assign({ cnSkin: 'gonglookout', ks: 'lookout', gong }, o || {}));   /* THE LOOKOUT: the rule's runner, kill-first */
  const whip = (x, y, squad, o) => foe('cutthroat', x, y, squad, Object.assign({ cnSkin: 'whipapprentice', ks: 'post' }, o || {}));          /* THE WHIP APPRENTICE: a lash with reach that pulls you */
  const sentry = (x, y, squad, gong, o) => foe('shield', x, y, squad, Object.assign({ cnSkin: 'shieldsentry', ks: 'planted', gong }, o || {}));   /* THE SHIELD SENTRY: planted before a gong */
  const smoke = (x, y, squad, o) => foe('sapper', x, y, squad, Object.assign({ cnSkin: 'smokethrower', ks: 'post' }, o || {}));               /* THE SMOKE THROWER: his pots burst in smoke */
  const slinger = (x, y, squad, o) => foe('slinger', x, y, squad, Object.assign({ cnSkin: 'wallslinger', ks: 'post' }, o || {}));            /* THE WALL SLINGER: the ranged one, on the parapets */
  const hawk = (x0, x1, y, squad) => ent('hawkscout', (x0 + x1) >> 1, y, { squad, x0, x1 });                                                     /* THE HAWK SCOUT: the one new AI (src/ksar-foes.js) */
  /* THE RULE'S PIECES (src/ksar-hands.js reads them off L): gongs, keg stacks, set kegs, flask racks, barricades, the winch and its gate, the cellar's weak roof */
  const gongs = [], stacks = [], setKegs = [], racks = [], barricades = [], weak = [], interiors = [], decor = [], vaultDoors = [];
  /* a GONG: its frame stands on the floor whose surface row is y+1 (the hero's feet row is y); ear/earY: its earshot in tiles (half-width, rows up/down) */
  const gong = (id, x, y, o) => { gongs.push(Object.assign({ id, x, y, ear: 18, earY: 7 }, o || {})); ent('ksgong', x, y, { id }); };
  const stack = (id, x, y, kind, n) => { stacks.push({ id, x, y, kind: kind || 'keg', n: n || 3 }); ent(kind === 'flask' ? 'ksflasks' : 'kskegs', x, y, { id }); };
  const kegAt = (id, x, y, o) => { setKegs.push(Object.assign({ id, x, y }, o || {})); ent('kskeg', x, y, { id }); };
  /* a BARRICADE: a bricked-up arch (solid cells, drawn as rough mud-brick, cracked): a keg's blast in reach breaks it for good */
  const barricade = (id, x0, x1, y0, y1) => { block(x0, x1, y0, y1); barricades.push({ id, x0, x1, y0, y1 }); ent('ksbarricade', x0, y1, { id }); };
  const seal = (x, y) => ent('stray', x, y, { kind: 'caravanseal' });
  /* THE DESERT'S SUN (the act's backdrop, as THE GLASS SEA's day: src/sunstroke.js - open sun fills the meter, shade resets it): the fort's SHADE is under its roofs,
     its guard huts, its arches and its AWNINGS (canvas on poles: shade, and cover from the hawks - src/ksar-hands.js). Placed so no walk on the route is over
     SUN.maxWalk in the sun (tools/ksar.mjs) */
  const shade = [], shadeBox = (x0, x1, y0, y1) => shade.push([x0 * TS, (x1 + 1) * TS, y0 * TS, (y1 + 1) * TS + 1]);
  const awning = (x0, x1, row, floor) => { decor.push({ kind: 'awning', x0, x1, y: row }); shadeBox(x0, x1, row + 1, floor - 1); };
  const hut = (x0, x1, roof, floor) => { block(x0, x1, roof, roof); block(x0, x0, roof + 1, roof + 2); block(x1, x1, roof + 1, roof + 2); interiors.push([x0 + 1, x1 - 1, roof + 1, floor - 1, 'ksHut']); decor.push({ kind: 'hut', x0, x1, y: roof, floor }); };

  // ================= 1. THE CARAVAN ROAD (0-71): TEACH - the cut, the ring, the throw, all where failure is cheap =================
  ground(0, 7, 38); ground(8, 11, 36); ground(12, 71, B);                        /* THE FIRST SCREEN ASKS: two hops up the wadi bank onto the road */
  sign(3, 37, 'THE BANDIT KSAR. THE FORT ANSWERS ITS GONGS.');
  decor.push({ kind: 'palmstump', x: 18, y: B - 1 }, { kind: 'milestone', x: 24, y: B - 1 });
  boards(14, 25, 31); slinger(21, 30, 'shelfSling', { face: -1 });             /* the wadi's rock shelf over the road (a second height), a slinger on it over the bank */
  /* THE FIRST GONG (TEACH, safe): its lookout is asleep beside it; the guard hut's two sleepers are in its earshot. Cut the rope (ATTACK) and it is silent;
     ring it (E) - or wake the lookout - and the sleepers come out */
  sign(28, B - 1, 'A GONG CALLS EVERY BANDIT IN EARSHOT. A BLADE CUTS ITS ROPE; E RINGS IT.');
  lookout(33, B - 1, 'roadGong', 'g1', { asleep: true, face: 1 });
  gong('g1', 37, B - 1, { ear: 18 });
  hut(41, 51, 28, B);                                                            /* the guard hut on the road: roofed, open at both ends */
  slinger(47, 27, 'hutSling', { face: -1 });                                    /* a wall slinger on the hut's roof (THE RANGED ONE, from the first screen on) */
  blade(45, B - 1, 'roadHut', { ks: 'reserve', face: 1 }); blade(48, B - 1, 'roadHut', { ks: 'reserve', face: -1 });
  /* THE FIRST KEG (TEACH, THROW, safe): a stack on the road, and THE BRICKED ARCH in the wall's foot (the old caravan gate, a seal behind it) */
  stack('roadKegs', 56, B - 1, 'keg', 3);
  sign(58, B - 1, 'POWDER KEGS: E TAKES ONE, ATTACK THROWS IT. IT BREAKS BRICK.');
  boards(60, 66, 32); boards(64, 70, 30); boards(68, 71, 28);                    /* the stair up the outer wall (two-row steps, overlapping: up through each) */

  // ================= 2. THE OUTER WALLS (72-231): TEST - cut under a lookout's eye; the hawk; the planted sentry =================
  block(72, 231, WW, H - 1);                                                     /* the outer wall: its walk is row 28 */
  air(73, 79, 30, B - 1); barricade('arch', 72, 72, 30, B - 1); interiors.push([73, 79, 30, B - 1, 'ksVault']); seal(77, B - 1);   /* SEAL ONE behind the bricked arch */
  decor.push({ kind: 'parapet', x0: 72, x1: 231, y: WW });
  /* TOWER TWO (a seal and a silver on its top: a climb off the walk) */
  boards(92, 94, 26); boards(95, 96, 24); block(97, 102, 22, WW - 1); seal(99, 21); ent('silver', 101, 21); slinger(100, 21, 'towerTwoSling', { face: -1 });   /* (it stands on the walk: the way on is over it) */
  /* THE WALL HUT (its sleepers answer gong two) */
  hut(108, 122, 22, WW); slinger(119, 21, 'wallHutSling', { face: -1 });
  blade(112, WW - 1, 'wallHut', { ks: 'reserve', face: 1 }); blade(117, WW - 1, 'wallHut', { ks: 'reserve', face: -1 });
  /* THE LOOKOUT (TEST): he walks the stretch before gong two; seeing you he runs for it (told) - cut it first, kill him on his way, or slip by in smoke */
  lookout(130, WW - 1, 'wallLookout', 'g2', { patrol: [126, 136], face: -1 });
  blade(144, WW - 1, 'wallPair', { face: -1 }); blade(147, WW - 1, 'wallPair', { face: -1 });   /* the walk's guard past gong two (they answer it) */
  gong('g2', 140, WW - 1, { ear: 22 });
  sign(124, WW - 1, 'A LOOKOUT RUNS FOR HIS GONG WHEN HE SEES YOU. SMOKE HIDES YOU.');
  smoke(151, WW - 1, 'wallSmoke');
  hawk(104, 200, 13, 'wallHawk');                                                /* THE FIRST HAWK SCOUT: it patrols the walls; a shriek sends the lookouts running */
  sign(146, WW - 1, 'HER HAWKS WATCH THE WALLS: A FLASK BLINDS ONE.');
  stack('wallFlasks', 148, WW - 1, 'flask', 2);
  /* TOWER THREE: a wall slinger on its top (THE RANGED ONE); its top drops onto the sentry's ledge */
  block(158, 164, 21, WW - 1); slinger(161, 20, 'towerSling', { face: -1 }); boards(152, 154, 26); boards(155, 157, 24);   /* (over it, as tower two) */
  ent('check', 168, WW - 1);                                                     /* CHECKPOINT ONE, at tower three's foot */
  boards(165, 186, 24);                                                          /* the ledge over the sentry: drop in behind him */
  /* THE SHIELD SENTRY, PLANTED before gong three (he rings it himself on the alarm): go round him - over the ledge, or a jump - to its rope */
  sentry(180, WW - 1, 'g3Sentry', 'g3', { face: -1 }); gong('g3', 183, WW - 1, { ear: 20 });
  whip(196, WW - 1, 'wallWhip', { face: -1 });                                   /* the first whip apprentice: his lash pulls you */
  decor.push({ kind: 'banner', x: 205, y: WW - 1 });

  // ================= 3. THE GATE WINCH (232-272): SET PIECE ONE - RING THE GREAT GONG TO EMPTY THE GATEHOUSE (REQUIRED) =================
  /* THE GREAT GONG on its tower (a three-row hop off the walk); the HIGH WALK runs east from it over the yard to the gatehouse; the yard below */
  block(232, 238, 25, H - 1); gong('great', 236, 24, { ear: 34, earY: 14, great: true });
  sign(233, 24, 'THE GREAT GONG: E RINGS IT. ITS EARSHOT REACHES THE GATEHOUSE.');
  boards(239, 251, 26); ground(239, 256, B);
  hawk(224, 272, 14, 'yardHawk');                                                /* a hawk scout over the yard and the gate */
  blade(241, B - 1, 'yard', { face: -1 }); whip(245, B - 1, 'yard', { face: -1 }); blade(249, B - 1, 'yard', { face: -1 });   /* the yard's guards (they answer the great gong too) */
  /* THE GATEHOUSE: the gate passage (rows 30-33) behind THE PORTCULLIS (column 257); over it THE GUARD ROOM (rows 24-28) behind its GRILLE (column 257,
     rows 24-28: bars - you cannot get in, a called man gets out). THE WINCH stands in the yard at 253: its brake is held while any of the squad is in the
     guard room or within KS.brakeR of the winch */
  block(257, 272, 15, H - 1);
  air(258, 272, 30, B - 1);                                                      /* the gate passage (out east at 272) */
  air(258, 268, 24, 28);                                                         /* the guard room */
  interiors.push([258, 271, 30, B - 1, 'ksGate'], [258, 268, 24, 28, 'ksGuardRoom']);
  const gate = { x: 257, y0: 30, y1: B - 1, winch: [253, B - 1], grille: { x: 257, y0: 24, y1: 28 }, room: [258, 268, 24, 28], notches: 4 };
  ent('kswinch', 253, B - 1, { id: 'winch' });
  sign(250, B - 1, 'THE GATE WINCH: E HAULS IT. THE GATEHOUSE HOLDS ITS BRAKE.');
  blade(261, 28, 'gatehouse', { ks: 'gatehouse', face: -1 }); whip(263, 28, 'gatehouse', { ks: 'gatehouse', face: -1 }); blade(266, 28, 'gatehouse', { ks: 'gatehouse', face: -1 });
  slinger(266, 14, 'gateSling', { face: -1 });                                   /* on the gatehouse roof: he throws at the high walk */
  seal(266, B - 1);                                                              /* SEAL THREE, in the gate passage */

  // ================= 4. THE SOUQ YARD (273-357): REMIX - RING A GONG TO DRAW A SQUAD ONTO A KEG =================
  ground(273, 357, B);
  ent('check', 276, B - 1);                                                      /* CHECKPOINT TWO, past the gate */
  boards(282, 300, 27); boards(330, 346, 27); slinger(296, 26, 'souqSling', { face: -1 }); ent('silver', 284, 26);   /* the souq's roof walks (a second height): a slinger on one, a silver on the other end */
  for (const [x0, x1] of [[281, 284], [290, 293], [334, 337]]) { boards(x0, x1, 30); decor.push({ kind: 'stall', x0, x1, y: 30 }); }   /* the souq's stalls: their awnings are ledges */
  /* THE SOUQ GONG under its roof; the roof (a two-row hop off the ledge) carries a keg stack over it */
  boards(304, 306, 31); block(308, 326, 29, 29); interiors.push([309, 325, 30, B - 1, 'ksSouq']); decor.push({ kind: 'souqroof', x0: 308, x1: 326, y: 29 });   /* (the souq's covered hall: its roof stands on the hall, src/ksar-hands.js draws its posts) */
  gong('souq', 318, B - 1, { ear: 30 });
  stack('souqKegs', 323, 28, 'keg', 3); blade(358, 24, 'terraceGuard', { face: -1 });
  sign(300, B - 1, 'RING THE GONG AND THEY COME TO IT. A KEG FROM THE ROOF MEETS THEM.');
  /* THE STAIR'S SQUAD (a whip apprentice and two blades) at the foot of the only stair up */
  blade(340, B - 1, 'stairSquad', { face: -1 }); whip(344, B - 1, 'stairSquad', { face: -1 }); blade(348, B - 1, 'stairSquad', { face: -1 });
  hawk(284, 380, 13, 'souqHawk');                                                 /* a hawk scout over the souq and the terrace */
  boards(350, 352, 31); boards(353, 355, 28);                                    /* the stair up to the terrace (row 25) */

  // ================= 5. THE POWDER STORE (358-445): SET PIECE TWO - THE CHAIN (REQUIRED THROW) =================
  block(356, 445, 25, H - 1);                                                    /* the terrace and the store's long roof (row 25) */
  decor.push({ kind: 'minaret', x: 366, y: 24, top: 8 });
  /* THE TERRACE: its runner and the second souq gong (CUT under pressure) */
  lookout(372, 24, 'terraceLookout', 'terrace', { patrol: [362, 376], face: -1 });
  boards(358, 363, 16); slinger(360, 15, 'minaretSling', { face: -1 });          /* the minaret's balcony and its slinger */
  hut(382, 388, 19, 25); blade(384, 24, 'terraceHut', { ks: 'reserve', face: -1 }); blade(386, 24, 'terraceHut', { ks: 'reserve', face: 1 });   /* the terrace's guard hut: its sleepers answer the terrace gong */
  gong('terrace', 380, 24, { ear: 24, earY: 9 });
  ent('check', 392, 24);                                                         /* CHECKPOINT THREE, at the store's door */
  stack('storeKegs', 389, 24, 'keg', 2);
  sign(394, 24, 'THE POWDER STORE. A BLOW LIGHTS A KEG; ONE BLAST SETS OFF THE NEXT.');
  /* THE CHAIN: six kegs set along the roof; kicked (or blasted) the first lights the next in reach, keg by keg, and the last blows THE BRICKED ARCH
     over the only way on (an overhang over it: no way over) */
  for (const [i, x] of [400, 408, 416, 424, 432, 440].entries()) kegAt('k' + i, x, 24, { chain: true });
  barricade('storeArch', 443, 444, 17, 24);                                       /* THE BRICKED ARCH: eight rows of mud-brick across the roof - no way over it */
  /* THE ROOF SQUAD (the short chain's victims) and the store's cellar under its weak roof (a seal) */
  blade(411, 24, 'roofSquad', { face: -1 }); smoke(414, 24, 'roofSquad'); blade(419, 24, 'roofSquad', { face: -1 });
  air(417, 430, 26, 31); interiors.push([417, 430, 26, 31, 'ksCellar']); for (let x = 423; x <= 425; x++) weak.push([x, 25]);   /* (three tiles: a hole a hero leaps, or drops into) */
  seal(427, 31); ent('silver', 418, 31); boards(419, 421, 29); boards(423, 425, 27);   /* the ledges back up out of the cellar, through the hole */
  hawk(396, 458, 11, 'storeHawk');

  // ================= 6. THE HAWK TOWER ROOFS (446-583): THE EXAM - THE WHOLE FORT WAKES =================
  block(445, 458, 25, H - 1); boards(456, 458, 22);                              /* past the arch: the roof, and a step up */
  block(459, 499, 19, H - 1);                                                    /* ROOF ONE (row 19) */
  lookout(470, 18, 'roofLookoutA', 'roofA', { patrol: [464, 476], face: 1 }); gong('roofA', 480, 18, { ear: 26, earY: 10 });
  boards(487, 489, 17); boards(491, 496, 15); slinger(494, 14, 'parapetSling', { face: 1 });   /* the parapet (a walk on posts over the roof) and its slinger */
  ent('check', 486, 18);                                                         /* CHECKPOINT FOUR */
  block(500, 539, 21, H - 1);                                                    /* ROOF TWO (row 21) */
  boards(497, 526, 17); seal(525, 16);                                           /* the high ledge over the sentry: SEAL FIVE at its end */
  sentry(517, 20, 'roofSentry', 'roofB', { face: -1 }); gong('roofB', 520, 20, { ear: 24, earY: 10 }); blade(508, 20, 'roofTwo', { face: -1 });
  whip(532, 20, 'roofWhip', { face: -1 });
  hawk(470, 540, 8, 'roofHawkA'); hawk(528, 580, 9, 'roofHawkB');
  block(540, 575, 19, H - 1);                                                    /* ROOF THREE (row 19) */
  stack('roofKegs', 545, 18, 'keg', 3);
  lookout(556, 18, 'roofLookoutC', 'roofC', { patrol: [550, 560], face: -1 }); gong('roofC', 564, 18, { ear: 22, earY: 10 });
  boards(572, 575, 15); slinger(574, 14, 'roofThreeSling', { face: -1 }); blade(567, 18, 'roofSquadC', { face: -1 }); whip(569, 18, 'roofSquadC', { face: -1 }); blade(571, 18, 'roofSquadC', { face: -1 });
  /* THE WAY DOWN to the courtyard door: a shaft east of roof three; THE STRONGROOM's door in its west wall (five seals open it) */
  ground(576, 583, B); interiors.push([576, 582, 26, B - 1, 'ksShaft']);   /* the shaft to the courtyard door (a room: the courtyard's wall over its door stands on it) */
  air(569, 574, 30, B - 1); interiors.push([569, 574, 30, B - 1, 'ksStrongroom']); block(575, 575, 30, B - 1); vaultDoors.push({ id: 'strongroom', x: 575, y0: 30, y1: B - 1, seals: 5 });
  ent('silver', 571, B - 1); ent('ksvault', 575, B - 1, { id: 'strongroom' });
  sign(578, B - 1, 'THE STRONGROOM. FIVE CARAVAN SEALS OPEN ITS DOOR.');
  ent('check', 581, B - 1);                                                      /* CHECKPOINT FIVE, at the courtyard door */

  // ================= THE FORT'S POWDER (single kegs set by its posts: a blow lights one - a squad's ruin, or a careless swing's) =================
  /* every post keeps its powder by it (the raiders blow the road's caravans open): told as every keg is (a fuse that fizzes, a ring), kicked where it stands. A hero who
     swings at everything blasts himself; one who looks kicks it into the squad and steps back */
  for (const [x, y] of [[34, B - 1], [78, WW - 1], [89, WW - 1], [120, 21], [159, 20], [138, WW - 1], [150, WW - 1], [194, WW - 1], [218, WW - 1], [250, 25], [290, B - 1], [314, B - 1], [338, B - 1], [364, 24], [376, 24],
    [471, 18], [483, 18], [507, 20], [519, 20], [531, 20], [562, 18]]) kegAt('post' + x, x, y);

  // ================= THE SHADE (the awnings and what the roofs throw) =================
  shadeBox(0, 9, 32, 37); shadeBox(18, 22, 32, 33);                            /* the wadi's bank, and a hollow under the rock shelf */
  awning(77, 80, 22, WW); awning(99, 102, 16, 22); awning(116, 119, 16, 22); awning(141, 144, 22, WW);   /* the walk: an awning, tower two's top, the wall hut's roof, gong two's awning */
  awning(160, 163, 15, 21); awning(178, 181, 18, 24); awning(205, 209, 22, WW);   /* tower three's top, the sentry's ledge, an awning on the way to the great gong */
  awning(233, 237, 19, 25); shadeBox(244, 256, 27, B - 1);                      /* the great gong's tower, the yard under the gatehouse's wall */
  for (const [x0, x1] of [[281, 284], [290, 293], [334, 337]]) shadeBox(x0, x1, 31, B - 1);   /* the souq's stalls (their awnings) */
  awning(286, 289, 22, 27); awning(340, 343, 22, 27); shadeBox(359, 362, 17, 24);   /* awnings on the roof walks; the minaret's balcony */
  awning(412, 416, 19, 25); shadeBox(441, 447, 19, 24);                         /* the store's roof squad under canvas; the overhang over the arch */
  awning(468, 471, 13, 19); shadeBox(491, 496, 16, 18); awning(512, 516, 13, 21); awning(533, 536, 15, 21); awning(550, 553, 13, 19); shadeBox(572, 575, 16, 18);   /* the roofs: awnings, the parapet, the perch */
  shadeBox(576, 583, 26, B - 1);                                                 /* the shaft to the courtyard door */

  // ================= THE HAWK-MISTRESS's COURTYARD (src/hawk-mistress.js) =================
  const AX = 584;
  const stage = stageHawkMistress({ set, block, ent, air }, T, TS, AX, B);
  ground(AX, AX + HM_STAGE.W - 1, B);
  block(AX + HM_STAGE.W, W - 1, 0, H - 1);
  stage.carve(); gongs.push(...stage.gongs); stacks.push(...stage.racks);   /* the courtyard's gongs and flask racks are the level's (src/ksar-hands.js rings, cuts and hands them out) */
  ent('gate', AX + HM_STAGE.W - 2, B - 1);

  /* the rule's gadgets the level tools read as ents are placed above (ksgong, kskegs, ksflasks, kskeg, ksbarricade, kswinch, ksvault) */
  const START = { x: 3, y: 37 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: [], interiors,
    arena: stage.arena, gateAfterBoss: true,
    ksar: true, caravan: true,   /* caravan: the desert's hands in main.js (the bandits' machines, the sand and stone skins, THE SUN: the act's backdrop - the courtyard is shade, src/ksar-hands.js noSun) */
    gongs, stacks, setKegs, racks, barricades, weak, gate, decor, vaultDoors,
    alarms: gongs.map(g => ({ x0: g.x - g.ear, x1: g.x + g.ear })),   /* THE RULE'S STATE for tools/rule-state.mjs: each gong's earshot is where the fort answers it */
    sun: [{ x0: 0, x1: 584 }], shade, shadeArt: shade,   /* THE DESERT'S SUN, the backdrop (not the rule): the shade boxes, tinted violet by main.js (the art pass may paint them) */   /* THE RULE'S STATE for tools/rule-state.mjs: each gong's earshot is where the fort answers it */
    quest: { n: 5, item: 'caravanseal', name: 'SEALS', done: 'FIVE SEALS: THE STRONGROOM OPENS', thanks: 'THE STRONGROOM OPENS' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,
    squadBands: [{ lo: 600, hi: 799, spots: 0, why: "THE HAWK-MISTRESS'S COURTYARD: columns 584-623 are her arena - no squad stands in a boss arena (her guard comes down in phase two)" }],
    unlocks: [
      { kind: 'ksgong', opens: 'a call: every bandit in its earshot leaves his post for it (the gatehouse squad off the winch\'s brake); cut, it is silent for good', hud: 'THE GONG CALLS THEM / THE ROPE IS CUT: THE GONG IS SILENT' },
      { kind: 'kskegs', opens: 'a powder keg in the hand: thrown, it blasts the bricked arches open and sets off the store\'s chain', hud: 'POWDER KEGS: E TAKES ONE, ATTACK THROWS IT' },
      { kind: 'kswinch', opens: 'the portcullis, notch by notch, while no one of the gatehouse holds its brake', hud: 'THE GATE RISES / THE BRAKE IS ON: THE GATEHOUSE HOLDS IT' },
      { kind: 'stray', opens: 'THE STRONGROOM by the courtyard once all five caravan seals are carried (a silver)', hud: 'SEALS n/5 - THE STRONGROOM WAITS (the quest counter)' },
    ],
    music: 'ksar',
    ambient: [{ x0: 0, x1: 99999, kind: 'ksar' }],   /* its own bed: src/audio.js SYNTH_BEDS.ksar (wind over the walls, a far gong's hum, the souq, a hawk) */
    rockZones: [], masonry: [[72, 583, 0, H - 1]],   /* the fort is mud-brick and ashlar: main.js paints it as coursed masonry, not the rock's strata */
    palette: { set: 'desert', near: 'none', dress: 'none', noFg: true, noNear: true, haze: 'rgba(220,170,110,0.10)' },
    duskStart: -1, duskLen: 1,
  };
}
