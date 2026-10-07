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
  const hut = (x0, x1, roof, floor) => { block(x0, x1, roof, roof); block(x0, x0, roof + 1, roof + 2); block(x1, x1, roof + 1, roof + 2); interiors.push([x0 + 1, x1 - 1, roof + 1, floor - 1, 'ksHut']); decor.push({ kind: 'hut', x0, x1, y: roof, floor }); };

  // ================= 1. THE CARAVAN ROAD (0-71): TEACH - the cut, the ring, the throw, all where failure is cheap =================
  ground(0, 7, 38); ground(8, 11, 36); ground(12, 71, B);                        /* THE FIRST SCREEN ASKS: two hops up the wadi bank onto the road */
  sign(3, 37, 'THE BANDIT KSAR. ' + RULE);
  decor.push({ kind: 'palmstump', x: 18, y: B - 1 }, { kind: 'milestone', x: 24, y: B - 1 });
  /* THE FIRST GONG (TEACH, safe): its lookout is asleep beside it; the guard hut's two sleepers are in its earshot. Cut the rope (ATTACK) and it is silent;
     ring it (E) - or wake the lookout - and the sleepers come out */
  sign(28, B - 1, 'A GONG CALLS EVERY BANDIT IN EARSHOT. A BLADE CUTS ITS ROPE; E RINGS IT.');
  lookout(33, B - 1, 'roadGong', 'g1', { asleep: true, face: 1 });
  gong('g1', 37, B - 1, { ear: 18 });
  hut(41, 51, 28, B);                                                            /* the guard hut on the road: roofed, open at both ends */
  blade(45, B - 1, 'roadHut', { ks: 'reserve', face: 1 }); blade(48, B - 1, 'roadHut', { ks: 'reserve', face: -1 });
  /* THE FIRST KEG (TEACH, THROW, safe): a stack on the road, and THE BRICKED ARCH in the wall's foot (the old caravan gate, a seal behind it) */
  stack('roadKegs', 56, B - 1, 'keg', 3);
  sign(58, B - 1, 'POWDER KEGS: E TAKES ONE, ATTACK THROWS IT. IT BREAKS BRICK.');
  boards(63, 65, 32); boards(66, 68, 30);                                        /* the stair up the outer wall (two-row steps) */

  // ================= 2. THE OUTER WALLS (72-231): TEST - cut under a lookout's eye; the hawk; the planted sentry =================
  block(72, 231, WW, H - 1);                                                     /* the outer wall: its walk is row 28 */
  air(73, 79, 30, B - 1); barricade('arch', 72, 72, 30, B - 1); interiors.push([73, 79, 30, B - 1, 'ksVault']); seal(77, B - 1);   /* SEAL ONE behind the bricked arch */
  decor.push({ kind: 'parapet', x0: 72, x1: 231, y: WW });
  /* TOWER TWO (a seal and a silver on its top: a climb off the walk) */
  boards(93, 95, 25); block(97, 102, 22, WW - 1); seal(99, 21); ent('silver', 101, 21);
  /* THE WALL HUT (its sleepers answer gong two) */
  hut(108, 122, 22, WW);
  blade(112, WW - 1, 'wallHut', { ks: 'reserve', face: 1 }); blade(117, WW - 1, 'wallHut', { ks: 'reserve', face: -1 });
  /* THE LOOKOUT (TEST): he walks the stretch before gong two; seeing you he runs for it (told) - cut it first, kill him on his way, or slip by in smoke */
  lookout(130, WW - 1, 'wallLookout', 'g2', { patrol: [126, 136], face: -1 });
  gong('g2', 140, WW - 1, { ear: 22 });
  sign(124, WW - 1, 'A LOOKOUT RUNS FOR HIS GONG WHEN HE SEES YOU. SMOKE HIDES YOU.');
  smoke(151, WW - 1, 'wallSmoke');
  hawk(118, 186, 13, 'wallHawk');                                                /* THE FIRST HAWK SCOUT: it patrols the walls; a shriek sends the lookouts running */
  sign(146, WW - 1, 'HER HAWKS WATCH THE WALLS: A FLASK BLINDS ONE.');
  stack('wallFlasks', 148, WW - 1, 'flask', 2);
  /* TOWER THREE: a wall slinger on its top (THE RANGED ONE); its top drops onto the sentry's ledge */
  block(158, 164, 21, WW - 1); slinger(161, 20, 'towerSling', { face: -1 }); boards(155, 157, 24);
  ent('check', 168, WW - 1);                                                     /* CHECKPOINT ONE, at tower three's foot */
  boards(166, 186, 24);                                                          /* the ledge over the sentry: drop in behind him */
  /* THE SHIELD SENTRY, PLANTED before gong three (he rings it himself on the alarm): go round him - over the ledge, or a jump - to its rope */
  sentry(180, WW - 1, 'g3Sentry', 'g3', { face: -1 }); gong('g3', 183, WW - 1, { ear: 20 });
  whip(196, WW - 1, 'wallWhip', { face: -1 });                                   /* the first whip apprentice: his lash pulls you */
  decor.push({ kind: 'banner', x: 205, y: WW - 1 });

  // ================= 3. THE GATE WINCH (232-272): SET PIECE ONE - RING THE GREAT GONG TO EMPTY THE GATEHOUSE (REQUIRED) =================
  /* THE GREAT GONG on its tower (a three-row hop off the walk); the HIGH WALK runs east from it over the yard to the gatehouse; the yard below */
  block(232, 238, 25, H - 1); gong('great', 236, 24, { ear: 34, earY: 14, great: true });
  sign(233, 24, 'THE GREAT GONG. ITS EARSHOT REACHES THE GATEHOUSE.');
  boards(239, 251, 26); ground(239, 256, B);
  blade(244, B - 1, 'yard', { face: -1 }); blade(249, B - 1, 'yard', { face: -1 });   /* the yard's guards (they answer the great gong too) */
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
  for (const [x0, x1] of [[281, 284], [290, 293], [334, 337]]) { boards(x0, x1, 30); decor.push({ kind: 'stall', x0, x1, y: 30 }); }   /* the souq's stalls: their awnings are ledges */
  /* THE SOUQ GONG under its roof; the roof (a two-row hop off the ledge) carries a keg stack over it */
  boards(304, 306, 31); block(308, 326, 29, 29); block(308, 308, 30, 30); block(326, 326, 30, 30); decor.push({ kind: 'souqroof', x0: 308, x1: 326, y: 29 });
  gong('souq', 318, B - 1, { ear: 30 });
  stack('souqKegs', 323, 28, 'keg', 3);
  sign(300, B - 1, 'RING THE GONG AND THEY COME TO IT. A KEG FROM THE ROOF MEETS THEM.');
  /* THE STAIR'S SQUAD (a whip apprentice and two blades) at the foot of the only stair up */
  blade(340, B - 1, 'stairSquad', { face: -1 }); whip(344, B - 1, 'stairSquad', { face: -1 }); blade(348, B - 1, 'stairSquad', { face: -1 });
  boards(350, 352, 31); boards(353, 355, 28);                                    /* the stair up to the terrace (row 25) */

  // ================= 5. THE POWDER STORE (358-445): SET PIECE TWO - THE CHAIN (REQUIRED THROW) =================
  block(356, 445, 25, H - 1);                                                    /* the terrace and the store's long roof (row 25) */
  decor.push({ kind: 'minaret', x: 366, y: 24, top: 8 });
  /* THE TERRACE: its runner and the second souq gong (CUT under pressure) */
  lookout(372, 24, 'terraceLookout', 'terrace', { patrol: [362, 376], face: -1 });
  gong('terrace', 380, 24, { ear: 24, earY: 9 });
  ent('check', 392, 24);                                                         /* CHECKPOINT THREE, at the store's door */
  stack('storeKegs', 389, 24, 'keg', 2);
  sign(394, 24, 'THE POWDER STORE. A BLOW LIGHTS A KEG; ONE BLAST SETS OFF THE NEXT.');
  /* THE CHAIN: six kegs set along the roof; kicked (or blasted) the first lights the next in reach, keg by keg, and the last blows THE BRICKED ARCH
     over the only way on (an overhang over it: no way over) */
  for (const [i, x] of [400, 408, 416, 424, 432, 440].entries()) kegAt('k' + i, x, 24, { chain: true });
  block(441, 456, 17, 18); barricade('storeArch', 443, 444, 19, 24);            /* THE BRICKED ARCH under the store's overhang */
  /* THE ROOF SQUAD (the short chain's victims) and the store's cellar under its weak roof (a seal) */
  blade(411, 24, 'roofSquad', { face: -1 }); smoke(414, 24, 'roofSquad'); blade(419, 24, 'roofSquad', { face: -1 });
  air(417, 430, 26, 31); interiors.push([417, 430, 26, 31, 'ksCellar']); for (let x = 422; x <= 426; x++) weak.push([x, 25]);
  seal(427, 31); boards(421, 423, 28); boards(418, 420, 29);
  hawk(396, 458, 11, 'storeHawk');

  // ================= 6. THE HAWK TOWER ROOFS (446-583): THE EXAM - THE WHOLE FORT WAKES =================
  block(445, 458, 25, H - 1); boards(456, 458, 22);                              /* past the arch: the roof, and a step up */
  block(459, 499, 19, H - 1);                                                    /* ROOF ONE (row 19) */
  lookout(470, 18, 'roofLookoutA', 'roofA', { patrol: [464, 476], face: 1 }); gong('roofA', 480, 18, { ear: 26, earY: 10 });
  block(492, 496, 15, 18); slinger(494, 14, 'parapetSling', { face: 1 });        /* the parapet and its slinger */
  ent('check', 486, 18);                                                         /* CHECKPOINT FOUR */
  block(500, 539, 21, H - 1);                                                    /* ROOF TWO (row 21) */
  boards(497, 526, 17); seal(525, 16);                                           /* the high ledge over the sentry: SEAL FIVE at its end */
  sentry(517, 20, 'roofSentry', 'roofB', { face: -1 }); gong('roofB', 520, 20, { ear: 24, earY: 10 });
  whip(532, 20, 'roofWhip', { face: -1 });
  hawk(470, 540, 8, 'roofHawkA'); hawk(528, 580, 9, 'roofHawkB');
  block(540, 575, 19, H - 1);                                                    /* ROOF THREE (row 19) */
  stack('roofKegs', 545, 18, 'keg', 3);
  lookout(556, 18, 'roofLookoutC', 'roofC', { patrol: [550, 560], face: -1 }); gong('roofC', 564, 18, { ear: 22, earY: 10 });
  blade(569, 18, 'roofSquadC', { face: -1 }); whip(572, 18, 'roofSquadC', { face: -1 }); blade(574, 18, 'roofSquadC', { face: -1 });
  /* THE WAY DOWN to the courtyard door: a shaft east of roof three; THE STRONGROOM's door in its west wall (five seals open it) */
  ground(576, 583, B);
  air(569, 574, 30, B - 1); interiors.push([569, 574, 30, B - 1, 'ksStrongroom']); block(575, 575, 30, B - 1); vaultDoors.push({ id: 'strongroom', x: 575, y0: 30, y1: B - 1, seals: 5 });
  ent('silver', 571, B - 1); ent('ksvault', 575, B - 1, { id: 'strongroom' });
  sign(578, B - 1, 'THE STRONGROOM. FIVE CARAVAN SEALS OPEN ITS DOOR.');
  ent('check', 581, B - 1);                                                      /* CHECKPOINT FIVE, at the courtyard door */
  boards(576, 578, 24); boards(579, 581, 28);                                    /* (ledges down the shaft: a hero may come down them or drop) */

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
    ksar: true, caravan: true,   /* caravan: the desert's hands in main.js (the bandits' machines, the sand and stone skins); THE SUN is not this level's rule: the fort is shade (src/ksar-hands.js noSun) */
    gongs, stacks, setKegs, racks, barricades, weak, gate, decor, vaultDoors,
    quest: { n: 5, item: 'caravanseal', name: 'SEALS', done: 'FIVE SEALS: THE STRONGROOM OPENS', thanks: 'THE STRONGROOM OPENS' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,
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
