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
  const gongs = [], stacks = [], setKegs = [], racks = [], barricades = [], weak = [], interiors = [], decor = [], vaultDoors = [], breaches = [], drops = [];
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
  /* THE BREACHES (claude/ksar fix pass, review MUST 1): the wall walk is broken in four places - a notch of rubble with SPIKES in it (a fall in bites and you climb
     out: A10's hurt, not a death). Taught bare at the first (a sign, no foe); after it every breach has a foe AT the jump: the lookout across the second, the whip
     apprentice whose lash pulls you into the third, a planted shield on the far lip of the fourth */
  const breach = (x0, x1) => { air(x0, x1, WW, WW); for (let x = x0; x <= x1; x++) set(x, WW + 1, T.SPIKE); breaches.push([x0, x1, WW]); };
  sign(80, WW - 1, 'THE WALL IS BREACHED: SPIKES IN THE RUBBLE. JUMP IT.');
  breach(84, 86);
  /* TOWER TWO (a seal and a silver on its top: a climb off the walk) */
  boards(92, 94, 26); boards(95, 96, 24); block(97, 102, 22, WW - 1); seal(99, 21); ent('silver', 101, 21); slinger(100, 21, 'towerTwoSling', { face: -1 });   /* (it stands on the walk: the way on is over it) */
  /* THE WALL HUT (its sleepers answer gong two) */
  hut(108, 122, 22, WW); slinger(119, 21, 'wallHutSling', { face: -1 });
  blade(112, WW - 1, 'wallHut', { ks: 'reserve', face: 1 }); smoke(117, WW - 1, 'wallHut', { ks: 'reserve', face: -1 });
  /* THE LOOKOUT (TEST) across THE SECOND BREACH: he walks the stretch before gong two; seeing you he runs for it (told) - jump the breach and cut it first, kill him
     on his way, or slip by in smoke. A hawk scout works LOW over the breach (its stoop lands on the jump) */
  sign(105, WW - 1, 'A LOOKOUT RUNS FOR HIS GONG WHEN HE SEES YOU. SMOKE HIDES YOU.');
  breach(124, 126);
  lookout(131, WW - 1, 'wallLookout', 'g2', { patrol: [128, 136], face: -1 });
  sentry(145, WW - 1, 'wallPair', null, { ks: 'post', face: -1 }); blade(148, WW - 1, 'wallPair', { face: -1 });   /* the walk's guard past gong two (front: a shield; they answer it) */
  gong('g2', 140, WW - 1, { ear: 22 });
  slinger(152, WW - 1, 'wallPairSling', { face: -1 });                           /* (the pair's back rank) */
  hawk(110, 150, 21, 'wallHawk');                                                /* THE FIRST HAWK SCOUT: low over the breach; a shriek sends the lookouts running */
  sign(141, WW - 1, 'HER HAWKS WATCH THE WALLS: A FLASK BLINDS ONE.');
  stack('wallFlasks', 143, WW - 1, 'flask', 2);
  /* TOWER THREE: a wall slinger on its top (THE RANGED ONE); its top drops onto the sentry's ledge */
  block(158, 164, 21, WW - 1); slinger(161, 20, 'towerSling', { face: -1 }); boards(152, 154, 26); boards(155, 157, 24);   /* (over it, as tower two) */
  ent('check', 168, WW - 1);                                                     /* CHECKPOINT ONE, at tower three's foot */
  boards(165, 186, 24);                                                          /* the ledge over the sentry: drop in behind him */
  /* THE SHIELD SENTRY, PLANTED before gong three (he rings it himself on the alarm): go round him - over the ledge, or a jump - to its rope */
  sentry(180, WW - 1, 'g3Sentry', 'g3', { face: -1 }); gong('g3', 183, WW - 1, { ear: 20 });
  /* THE THIRD BREACH and THE WHIP APPRENTICE on its far lip: his lash pulls you a step toward him - into the rubble */
  breach(189, 191);
  whip(194, WW - 1, 'wallWhip', { face: -1 }); smoke(199, WW - 1, 'wallWhip');
  decor.push({ kind: 'banner', x: 205, y: WW - 1 });
  /* THE FOURTH BREACH, under the great gong's tower: a shield on its far lip (his shove is a step back into it) and a slinger on the merlon over him */
  breach(214, 216);
  sentry(219, WW - 1, 'gongFoot', null, { ks: 'post', face: -1 }); boards(223, 225, 25); slinger(224, 24, 'gongFootSling', { face: -1 });

  // ================= 3. THE GATE WINCH (232-272): SET PIECE ONE - RING THE GREAT GONG TO EMPTY THE GATEHOUSE (REQUIRED) =================
  /* THE GREAT GONG on its tower (a three-row hop off the walk); the HIGH WALK runs east from it over the yard to the gatehouse; the yard below */
  block(232, 238, 25, H - 1); gong('great', 236, 24, { ear: 34, earY: 14, great: true });
  sign(233, 24, 'THE GREAT GONG: E RINGS IT. ITS EARSHOT REACHES THE GATEHOUSE.');
  boards(239, 251, 26); ground(239, 256, B);
  boards(246, 248, 32); boards(243, 245, 30); boards(240, 242, 28);                                    /* (fix pass) THE YARD STAIR back up to the high walk: drop in before the gong is rung and you can climb back to it (no soft lock) */
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
  sentry(340, B - 1, 'stairSquad', null, { ks: 'post', face: -1 }); whip(344, B - 1, 'stairSquad', { face: -1 }); blade(348, B - 1, 'stairSquad', { face: -1 });   /* front: a shield; the whip behind him; a blade on the stair's foot */
  hawk(284, 380, 13, 'souqHawk');                                                 /* a hawk scout over the souq and the terrace */
  boards(342, 349, 32); boards(347, 352, 30); boards(350, 355, 28); boards(353, 355, 26);   /* the stair up to the terrace (row 25): two-row steps, overlapping (up through each), every hero's legs */

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
  blade(411, 24, 'roofSquad', { face: -1 }); smoke(414, 24, 'roofSquad'); sentry(419, 24, 'roofSquad', null, { ks: 'post', face: -1 });
  air(417, 430, 26, 31); interiors.push([417, 430, 26, 31, 'ksCellar']); for (let x = 423; x <= 425; x++) weak.push([x, 25]);   /* (three tiles: a hole a hero leaps, or drops into) */
  seal(427, 31); ent('silver', 418, 31); boards(419, 421, 29); boards(423, 425, 27);   /* the ledges back up out of the cellar, through the hole */
  hawk(396, 458, 11, 'storeHawk');

  // ================= 6. THE HAWK TOWER ROOFS (446-583): THE EXAM - THE WHOLE FORT WAKES =================
  /* (claude/ksar fix pass, review MUSTs 1/3/4) THE ROOFS ARE BROKEN: between them the drop is to the wadi, far below - A FALL IS A DEATH here (A10 amended: the exam,
     taught by the wall's breaches and told by the sign at the first gap). Part one (to CHECKPOINT FOUR) is the gauntlet: three gaps with a foe at each - a hawk low
     on the first jump's arc, a lookout racing for his gong past the second, a planted SHIELD on the narrow roof you land on. Part two is THE CLIMAX, every verb
     under pressure, and CHECKPOINT FIVE after it: CUT the bridge gong's rope before the roof-two lookout rings it (THE ROOF BRIDGE is held up by that rope - the
     only way over the widest drop: CUT REQUIRED), RING the roof-three gong to draw the hawk tower's squad off their hut (or meet them), and THROW a keg at THE
     HAWK TOWER's bricked door (no set keg reaches it: THROW REQUIRED) */
  const drop = (x0, x1) => { air(x0, x1, 0, H - 1); drops.push([x0, x1]); };
  block(445, 458, 25, H - 1); boards(456, 458, 22);                              /* past the arch: the roof, and a step up */
  block(459, 466, 19, H - 1);                                                    /* ROOF ONE */
  sign(461, 18, 'THE ROOFS ARE BROKEN: A FALL BETWEEN THEM IS THE END.');
  drop(467, 469); hawk(458, 482, 15, 'roofHawkA');                               /* THE FIRST GAP: a hawk scout works low over its arc */
  block(470, 478, 19, H - 1);
  lookout(472, 18, 'roofLookoutA', 'roofA', { patrol: [471, 475], face: -1 }); gong('roofA', 477, 18, { ear: 26, earY: 10 });
  drop(479, 481);                                                                /* THE SECOND GAP: the lookout races you for his gong past it */
  block(482, 490, 19, H - 1);                                                    /* THE NARROW ROOF: a planted shield on its lip, a slinger on the parapet over it */
  sentry(483, 18, 'roofSentry', 'roofA', { face: -1 });
  boards(485, 489, 15); slinger(488, 14, 'parapetSling', { face: -1 });
  ent('check', 489, 18);                                                         /* CHECKPOINT FOUR, past the gauntlet */
  drop(491, 493);                                                                /* THE THIRD GAP, down to roof two */
  /* THE CLIMAX: ROOF TWO and THE ROOF BRIDGE */
  block(494, 523, 21, H - 1);
  boards(497, 520, 17); seal(519, 16); slinger(500, 16, 'ledgeSling', { face: 1 });   /* the high ledge over roof two: SEAL FIVE at its end, a slinger at its foot */
  whip(503, 20, 'roofTwo', { face: -1 }); blade(512, 20, 'roofTwo', { face: -1 });
  lookout(515, 20, 'roofLookoutB', 'bridge', { patrol: [510, 518], face: -1 });
  sign(498, 20, 'THE ROOF BRIDGE HANGS FROM THE GONG\'S ROPE: A BLADE CUTS IT DOWN.');
  gong('bridge', 521, 20, { ear: 34, earY: 10, bridge: [524, 530, 21] });       /* its rope holds THE ROOF BRIDGE up on the far side: cut, the gong drops silent and the bridge comes down */
  drop(524, 530); ent('ksbridge', 524, 21, { span: [524, 530, 21] });      /* THE WIDEST DROP: seven tiles, no jump crosses it */
  /* ROOF THREE: the roof-three gong, kegs, THE HAWK TOWER's guard hut, and THE HAWK TOWER, its door bricked */
  block(531, 575, 21, H - 1);
  gong('roofC', 535, 20, { ear: 24, earY: 10 });
  stack('roofKegs', 539, 20, 'keg', 3);
  hut(542, 553, 15, 21); slinger(548, 14, 'hutRoofSling', { face: -1 });
  blade(545, 20, 'towerSquad', { ks: 'reserve', face: -1 }); whip(548, 20, 'towerSquad', { ks: 'reserve', face: -1 }); sentry(551, 20, 'towerSquad', null, { ks: 'reserve', face: -1 });
  stack('towerKegs', 557, 20, 'keg', 2);
  sign(556, 20, 'THE HAWK TOWER\'S DOOR IS BRICKED: A THROWN KEG OPENS IT.');
  block(560, 575, 9, 20); air(562, 574, 14, 20); air(575, 575, 14, 20); interiors.push([562, 574, 14, 20, 'ksTower']);   /* THE HAWK TOWER: twelve rows over the roof, its room open to the shaft */
  barricade('towerArch', 560, 561, 14, 20);                                       /* its door: seven rows of brick */
  slinger(564, 8, 'towerTopA', { face: -1 }); slinger(571, 8, 'towerTopB', { face: -1 });   /* the tower top's slingers over the roof */
  hawk(512, 572, 12, 'roofHawkB');
  /* THE WAY DOWN to the courtyard door: the shaft east of the tower; THE STRONGROOM's door in its west wall (five seals open it) */
  ground(576, 583, B); interiors.push([576, 582, 26, B - 1, 'ksShaft']);   /* the shaft to the courtyard door (a room: the courtyard's wall over its door stands on it) */
  air(569, 574, 30, B - 1); interiors.push([569, 574, 30, B - 1, 'ksStrongroom']); block(575, 575, 30, B - 1); vaultDoors.push({ id: 'strongroom', x: 575, y0: 30, y1: B - 1, seals: 5 });
  ent('silver', 571, B - 1); ent('ksvault', 575, B - 1, { id: 'strongroom' });
  sign(578, B - 1, 'THE STRONGROOM. FIVE CARAVAN SEALS OPEN ITS DOOR.');
  ent('check', 581, B - 1);                                                      /* CHECKPOINT FIVE, at the courtyard door: after the climax */

  // ================= THE FORT'S POWDER (single kegs set by its posts: a blow lights one - a squad's ruin, or a careless swing's) =================
  /* (fix pass: 21 post kegs cut to 6, each by a squad you can read - kick it into them and step back; a careless swing beside it blasts you. The store's chain stays the set piece) */
  for (const [x, y] of [[44, B - 1], [147, WW - 1], [244, B - 1], [337, B - 1], [507, 20], [550, 20]]) kegAt('post' + x, x, y);

  // ================= THE SHADE (the awnings and what the roofs throw) =================
  shadeBox(0, 9, 32, 37); shadeBox(18, 22, 32, 33);                            /* the wadi's bank, and a hollow under the rock shelf */
  awning(77, 80, 22, WW); awning(99, 102, 16, 22); awning(116, 119, 16, 22); awning(141, 144, 22, WW);   /* the walk: an awning, tower two's top, the wall hut's roof, gong two's awning */
  awning(160, 163, 15, 21); awning(178, 181, 18, 24); awning(205, 209, 22, WW);   /* tower three's top, the sentry's ledge, an awning on the way to the great gong */
  awning(233, 237, 19, 25); shadeBox(244, 256, 27, B - 1);                      /* the great gong's tower, the yard under the gatehouse's wall */
  for (const [x0, x1] of [[281, 284], [290, 293], [334, 337]]) shadeBox(x0, x1, 31, B - 1);   /* the souq's stalls (their awnings) */
  awning(286, 289, 22, 27); awning(340, 343, 22, 27); shadeBox(359, 362, 17, 24);   /* awnings on the roof walks; the minaret's balcony */
  awning(412, 416, 19, 25); shadeBox(441, 447, 19, 24);                         /* the store's roof squad under canvas; the overhang over the arch */
  awning(460, 464, 13, 19); awning(472, 475, 13, 19); shadeBox(485, 489, 16, 18); shadeBox(497, 520, 18, 20); awning(533, 537, 15, 21);   /* the roofs: awnings, the parapet, the high ledge's shade (the hut and the tower are roofed) */
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
    gongs, stacks, setKegs, racks, barricades, weak, gate, decor, vaultDoors, breaches, drops,
    /* THE FORT HITS HARD (fix pass, review MUST 2: weight, not hazards): a fort man's blow x this, on top of the act's tier (src/foe-react.js) - a blade's cut is ~12% of a
       campaign-level hero, a shield's bash ~12%: every one a 1v1 threat (main.js damagePlayer0 reads L.foeHit by cnSkin). A slinger's stone is KS.stoneDmg */
    foeHit: { ksarblade: 3.6, gonglookout: 2.6, whipapprentice: 3.6, shieldsentry: 3.0, smokethrower: 2.2 },
    foeHp: { ksarblade: 2.6, gonglookout: 1.6, whipapprentice: 2.6, shieldsentry: 2.4, wallslinger: 1.6, smokethrower: 1.8 },   /* ...and stands a blow or two longer (main.js spawn reads L.foeHp by cnSkin) */
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
