// src/underwell.js - THE UNDERWELL, desert arc level 3 (claude/underwell, the GREYBOX: geometry, the oil rule, the machines, the encounters,
// the wiring). Concept: docs/concepts/the-underwell.md (Daniel's 10-03 concept: the old cistern tunnels under THE WELL TOWN, dried when the
// Djinn's well took the water; scorpions nested in the dark; lamp oil seeping out of the old works). Main road: welltown > UNDERWELL > redgorge.
//
// (claude/underwell2, Daniel 10-06: TORCHES ARE TAKEN (E) AND THROWN (ATTACK) in a told arc - src/carry-throw.js; strike-to-drop is gone; the Great Lamp stays a strike on
//  its chain; a longer underground - THE DROWNED CISTERN, with the oil thieves, the cistern bats and the drowned dead; foes up top as well as below)
// THE RULE: STRIKE A TORCH AND THE OIL BURNS - THE BROOD WON'T CROSS FIRE. POUR WATER WHERE THE FIRE MUST NOT GO. (claude/underwell fix pass: lit oil
// burns itself out in OIL.burn / OIL.burnDeep s; only THE OLD OIL FIRES need water to go out)
// The verbs: LIGHT (strike a wall torch, or THE GREAT LAMP's chain: it falls into the oil) and POUR (the Well Town's skin: a fire goes out, and oil
// poured BEFORE it burns is WET and will not catch - a firebreak). src/underwell-hands.js keeps the oil's state per cell (oil / burning / wet /
// spent) and draws it: a black sheen, running flames, dark wet stone, burnt black. A lit cell burns OIL.burn s, then is spent; wet oil dries and
// spent oil seeps back after OIL.back s (nothing is lost for good: no softlock). Fire burns a BROOD NEST away (the plugs that seal the tunnels),
// boils a DRIP dry, burns a rope ladder to ash (a spare is lowered after OIL.rehang s, and on a respawn), drives a SANDWORM under, and holds the brood back.
//
// THE THEMED KEY: three BRASS TAPS (the old well-keeper's: L.quest). Fitted to THE DRY FOUNTAIN in the oil works, water runs: it is a spring from then
// on, and its vault opens (a silver). The HUD counts them (TAPS n/3).
//
// SECTIONS (columns BEFORE the two water sections were let in - uwX(column) is where each stands now; the floor is mostly row 44, the oil works' upper floor
// row 30, the sump's sand row 46). (claude/underwell3, Daniel 10-07 "TWO MORE like the Drowned Cistern") THE SPILLWAY (TEACH the water: 48 new columns
// at the old 244, the upper works' east end) and THE OLD RESERVOIR (TEST: 44 new columns at the old 346, the sump's stone rise) - the drowned cistern is
// their REMIX (the lob over the deep pool, the thieves):
//   0-44     THE DRY WELL      TEACH light, pour    down the dry well's shaft; at its foot a BROOD NEST seals the tunnel over the oil, and a torch hangs
//                                                   over it; then an OLD OIL FIRE and a drip in front of it
//   45-140   THE BROOD HALL    TEST + SET PIECE 1   a pillared cistern: THE GREAT LAMP hangs over the hall's oil on a chain (from the gallery: strike it -
//                                                   the whole floor burns); the brood chamber at its east end and the nest behind it (its own torch)
//   141-250  THE OIL WORKS     REMIX: firebreak     the rope up is ON the oil; the only fire for THE WORKS' NEST upstairs is the torch past it (its oil
//                                                   runs up a pipe): pour first, then light (REQUIRED); the upper works: THE DRY FOUNTAIN (the vault)
//   244-350  THE SILTED SUMP   REMIX + SET PIECE 2  sandworm floors under THE BURNING GUTTER: light it and the fire runs the length of the sump over the
//                                                   worms - the heat drives them under while it burns: cross then
//   437-532  THE DROWNED CISTERN  THROW REMIX + THE NEW CAST (claude/underwell2): drop into a flooded hall; oil floats on its shallow water and the drowned dead
//                                                   rise from it (a thrown torch burns them); LOB a torch over the deep pool onto the far nest's oil, swim under the
//                                                   bats (a torch scatters them); climb to THE THIEVES' GALLERY (oil thieves, their spilled oil, a sandworm up top)
//   351-451  THE LAMP STAIR    EXAM                 one connected oil: the rope up in it (firebreak), a torch, a nest, the gutter over a worm bed, the
//                                                   nest room's brood and THE SPRING (the water for the gallery's two oil fires); then the gallery, two oil
//                                                   fires, a spitter - then the stair to the Queen's door
//   533-599  THE QUEEN'S CISTERN  BOSS (was 452: shifted 96 east by the drowned cistern)              THE CISTERN QUEEN (src/cistern-queen.js stageCisternQueen, her code as WELLTOWN5 benched it)
import { stageCisternQueen } from './cistern-queen.js';

/* (claude/underwell3) THE TWO WATER SECTIONS ARE LET IN: [at, width] in the old columns - every column from `at` on moves east by `width`. The level below is
   written where it stood; uwX(old column) is where it stands now - tools, src/stuck-spots.js and the tile kit's zones ask the same function */
export const UW_INSERTS = [[244, 48], [346, 44]];
export const uwX = x => x + UW_INSERTS.reduce((s, [at, n]) => s + (x >= at ? n : 0), 0);
export const UW_SPILL = 244, UW_RES = 346 + 48;   /* their first true columns: THE SPILLWAY 244-291, THE OLD RESERVOIR 394-437 */
export const UNDERWELL = { W: 600 + 48 + 44, H: 60, floor: 44 };
export const SECTIONS = [['THE DRY WELL', 0], ['THE BROOD HALL', 45], ['THE OIL WORKS', 141], ['THE SILTED SUMP', 244], ['THE LAMP STAIR', 351], ['THE DROWNED CISTERN', 437], ["THE QUEEN'S CISTERN", 533]].map(([n, x]) => [n, uwX(x)])
  .concat([['THE SPILLWAY', UW_SPILL], ['THE OLD RESERVOIR', UW_RES]]).sort((a, b) => a[1] - b[1]);
/* each verb's arc (tile columns) - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/underwell.mjs and the concept page */
const ARCS0 = {
  light: { teach: [15, 23], test: [78, 132], remix: [150, 224], twist: [252, 335], exam: [351, 405] },   /* the shaft's nest; the great lamp; the works' nest up the pipe; the gutter; all of it */
  pour: { teach: [26, 34], test: [140, 160], remix: [150, 180], exam: [351, 430] },                      /* the old oil fire; the drip and the spring; the works' firebreak (required); the exam's break + two fires */
  brood: { teach: [118, 132], remix: [195, 214], exam: [400, 418] },                                      /* they will not cross fire */
  worm: { teach: [262, 335], exam: [373, 393], top: [170, 184] },                                        /* the heat drives them under (claude/underwell2: and up top - the upper works, the galleries) */
  throw: { teach: [12, 25], test: [116, 133], remix: [253, 262], twist: [469, 487], exam: [500, 532] },   /* (claude/underwell2) TAKE + THROW: the shaft's nest; the chamber door; the short toss into the gutter; the lob over the water; the thieves' gallery */
};
export const ARCS = Object.fromEntries(Object.entries(ARCS0).map(([k, a]) => [k, Object.fromEntries(Object.entries(a).map(([s, [x0, x1]]) => [s, [uwX(x0), uwX(x1)]]))]));
/* (claude/underwell3) THE WATER (the drowned dead and the bats): TAUGHT in the spillway (the shore's torch on the floating oil), TESTED in the old reservoir (the torch is up
   in the bats' dark - carry it and they keep off; the dead rise as you wade), REMIXED in the drowned cistern (the lob over the deep pool, the thieves) */
ARCS.water = { teach: [UW_SPILL + 5, UW_SPILL + 44], test: [UW_RES, UW_RES + 43], remix: [uwX(443), uwX(487)] };

export function buildUnderwell({ painter, T, TS }) {
  const { H } = UNDERWELL, W = 600, F = UNDERWELL.floor;   /* W: the width before the water sections - the columns below are written where they stood */
  const L = painter(UNDERWELL.W, H);
  /* (claude/underwell3) every hand below takes OLD columns and puts them through X (uwX); the two new sections switch X to true columns while they are drawn */
  let X = uwX; const TRUE = x => x;
  const set = (x, y, t) => L.set(X(x), y, t), block = (x0, x1, y0, y1) => L.block(X(x0), X(x1), y0, y1), ent = (t, x, y, o) => L.ent(t, X(x), y, o);
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const boards = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const ropes = []; const rope = (x, y0, y1, id) => ropes.push([X(x), y0, y1, id || null]);   /* (held in true columns) */   /* every rope is hung LAST, over what is carved */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ face: -1, squad }, o || {}));
  /* THE CAST (Daniel 10-05: scorpions and sandworms, in ELEMENTS - every one a proven machine under a skin, src/underwell-hands.js): */
  const scorp = (skin, x, y, squad, o) => foe('scorpion', x, y, squad, Object.assign({ cnSkin: skin }, o || {}));
  const venom = (x, y, squad, o) => scorp('venomscorpion', x, y, squad, o);    /* THE BROOD: the Queen's venom on your stamina */
  const fireS = (x, y, squad, o) => scorp('firescorpion', x, y, squad, o);     /* its burning patch lights any oil it touches */
  const oilS = (x, y, squad, o) => scorp('oilscorpion', x, y, squad, o);       /* its sting and its death leave a slick of oil */
  const dustS = (x, y, squad, o) => scorp('dustscorpion', x, y, squad, o);     /* its claw throws grit: blinds */
  const thirstS = (x, y, squad, o) => scorp('thirstscorpion', x, y, squad, o); /* drawn to your skin from far off; a sting that lands drinks a sip */
  const spitS = (x, y, squad, o) => foe('slinger', x, y, squad, Object.assign({ cnSkin: 'spitscorpion' }, o || {}));   /* THE SPITTING SCORPION: the slinger's machine, a venom glob */
  const worm = (x, y, b0, b1, squad, fast) => ent('sandworm', x, y, { squad, bed: [X(b0), X(b1)], ...(fast ? { fast: true } : {}) });   /* fast: src/desert-foes2.js FAST_WORM */
  /* THE OIL (src/underwell-hands.js): seeps = [x0, x1, row] runs of cells (a cell is the air over a floor: a hero standing there stands in it), lines =
     [x, row0, row1] the oil running down a wall or a pipe (fire climbs them). nests = the brood's plugs (solid, the blade turns off them; fire takes them) */
  const seeps = [], lines = [], nests = [], decor = [], interiors = [], vaultDoors = [], sand = [];
  const seep = (x0, x1, y) => seeps.push([X(x0), X(x1), y]);
  const line = (x, y0, y1) => lines.push([X(x), y0, y1]);   /* (claude/underwell2: a STREAK down a wall face - every cell beside rock, drawn flush on it, its foot on a floor or on oil) */
  const pipe = (x, y0, y1) => lines.push([X(x), y0, y1, 'pipe']);   /* (claude/underwell2) an iron STANDPIPE where no wall is: it stands on the floor (or in the floor's oil) and carries the oil up inside it; its top may enter the rock it feeds */
  const nest = (id, x0, x1, y0, y1) => { block(x0, x1, y0, y1); nests.push({ id, x0: X(x0), x1: X(x1), y0, y1 }); ent('nestplug', x0, y1, { id, x1: X(x1) }); };
  const sconce = (x, y, id) => ent('sconce', x, y, { id });   /* a wall torch: struck, it falls straight down into the oil under it */
  const drip = (x, y) => ent('skinwell', x, y, { jar: true, sips: 1, drip: true });   /* A DRIP: one sip a life (fire boils it dry) */
  const spring = (x, y) => ent('skinwell', x, y, { spring: true });                 /* A SPRING: a full skin (at the checkpoints) */
  const oilfire = (x, y) => ent('oilfire', x, y, { barricade: true });                /* AN OLD OIL FIRE: a wall of fire until a pour puts it out */
  const tap = (x, y) => ent('stray', x, y, { kind: 'tap' });
  /* (claude/underwell2) THE DROWNED CISTERN's water: wade = standing water over a floor (row = the air row over it), swim = a deep pool cut into the floor; and its cast */
  const pools = [];
  const wade = (x0, x1, row) => pools.push({ x0: X(x0) * TS, x1: (X(x1) + 1) * TS, y: row * TS + 4, shallow: true, depth: 12, cistern: true });
  const swim = (x0, x1, y0, y1) => { air(x0, x1, y0, y1); pools.push({ x0: X(x0) * TS, x1: (X(x1) + 1) * TS, y: y0 * TS + 4, swim: true, clear: true, bottom: (y1 + 1) * TS, cistern: true }); };
  const dead = (x, y, squad) => ent('zombie', x, y, { buried: true, cnSkin: 'drowneddead', face: -1, squad });   /* THE DROWNED DEAD: the zombie's machine - they rise from the water as you come */
  const bat = (x, y, squad) => ent('bat', x, y, { cnSkin: 'cisternbat', squad });                           /* THE CISTERN BAT: the bat's machine - it drops on you in the dark, light scatters it */
  const thief = (x, y, squad, o) => foe('sapper', x, y, squad, Object.assign({ cnSkin: 'oilthief' }, o || {}));   /* THE OIL THIEF: the dynamite bandit's machine - a flask of lamp oil */

  // ================= THE ROCK =================
  block(0, W - 1, 0, H - 1);

  // ================= 1. THE DRY WELL (0-44): down the shaft, a nest, an oil fire =================
  air(3, 14, 3, F - 1);
  boards(3, 9, 7); sign(8, 6, 'THE UNDERWELL. THE OIL DOWN HERE BURNS. WATER IS ALL YOU CARRY.');
  boards(9, 14, 12); boards(3, 8, 17); boards(9, 14, 22); boards(3, 8, 27); boards(9, 14, 32); boards(3, 8, 37);
  drip(4, 26);                                                                /* the first drip, on the way down: a sip before anything asks for one */
  tap(3, 36);                                                                 /* TAP ONE: at the end of the last ledge */
  air(15, 44, 39, F - 1);                                                     /* the tunnel east (five rows) */
  seep(18, 25, F - 1); sconce(15, F - 3, 'shaft');                           /* THE FIRST LESSON (claude/underwell2): the torch on the bare stone at the shaft's foot, the oil ahead of it - TAKE it, THROW it on the oil, no foe near */
  nest('shaft', 24, 25, 39, F - 1);                                           /* the brood's nest seals the tunnel (rock over it) */
  sign(13, F - 1, 'A BROOD NEST SEALS THE TUNNEL. TAKE THE TORCH (E). THROW IT ON THE OIL (ATTACK).');
  block(27, 31, F - 1, F - 1); drip(29, F - 2);                              /* a step of fallen blocks, the drip on it */
  sign(33, F - 1, 'AN OLD OIL FIRE. ONLY WATER PUTS IT OUT: E POURS YOUR SKIN.');
  oilfire(36, F - 1);
  venom(42, F - 1, 'tunnelBrood');                                           /* the first of the brood, past the fire (the hall is theirs) */

  // ================= 2. THE BROOD HALL (45-140): THE GREAT LAMP; the brood chamber; the nest =================
  air(45, 131, 24, F - 1);
  block(58, 59, 41, F - 1); block(100, 101, 41, F - 1);                       /* fallen pillar drums on the floor (three rows: a hop) */
  boards(61, 67, 38); boards(69, 75, 35); boards(77, 85, 32);                 /* up to THE LAMP GALLERY (a row of old scaffold boards, a hop apart) */
  ent('greatlamp', 87, 31, { top: 24 });                                      /* SET PIECE ONE: THE GREAT LAMP on its chain over the hall's oil (strike the chain from the gallery) */
  sign(80, 31, 'STRIKE THE CHAIN: THE LAMP FALLS INTO THE OIL.');
  /* the hall's oil: the floor, over the drums (their faces and tops), to the nest at the east end */
  seep(46, 57, F - 1); line(57, 41, F - 2); seep(58, 59, 40); line(60, 41, F - 2); seep(60, 63, F - 1); block(64, 75, F - 1, F - 1); seep(64, 75, F - 2); seep(76, 83, F - 1); block(84, 92, F - 1, F - 1); seep(84, 92, F - 2); seep(93, 99, F - 1); line(99, 41, F - 2);   /* (the hall floor rises a step in two places: the oil runs up them) */ seep(100, 101, 40); line(102, 41, F - 2); seep(102, 116, F - 1); seep(119, 131, F - 1);   /* (claude/underwell2) the chamber's oil is its own: the lamp burns the hall, the chamber wants a thrown torch */
  dustS(94, F - 1, 'hallDust', { face: -1 }); venom(67, F - 2, 'hallStep', { face: -1 }); thirstS(71, F - 2, 'hallStep', { face: -1 });   /* on the hall's first step: the brood, and one that smells your water */                                 /* a dust scorpion on the hall floor */
  boards(103, 107, 38); spitS(105, 37, 'hallSpit', { face: -1 });             /* a spitter on a drum's scaffold, over the floor and the gallery */
  boards(110, 115, 35);
  sign(115, F - 1, 'THE CHAMBER: TAKE ITS TORCH (E), THROW IT ON THE OIL. A BLADE ON THE NEST SPILLS THE BROOD.');
  /* THE BROOD CHAMBER: a low vault at the hall's east end, the nest at its back */
  block(118, 131, 34, 38);
  venom(120, F - 1, 'brood', { face: -1 }); venom(123, F - 1, 'brood'); venom(126, F - 1, 'brood'); venom(129, F - 1, 'brood');
  sconce(118, F - 3, 'chamber');                                              /* the chamber's own torch, at its door on the dry sill (claude/underwell2: the brood shy from it; throw it in) */
  block(132, 140, 24, 38); nest('hall', 132, 133, 39, F - 1);
  ent('silver', 125, 33); tap(129, 33);                                       /* SILVER ONE and TAP TWO on the chamber's roof (from the spitter's scaffold) */
  interiors.push([118, 131, 39, F - 1, 'uwChamber']);
  air(134, 149, 39, F - 1);
  ent('check', 137, F - 1); spring(141, F - 1);                               /* CHECKPOINT ONE, and a spring: a full skin */

  // ================= 3. THE OIL WORKS (141-250): REMIX ONE, THE FIREBREAK (REQUIRED) =================
  /* (claude/underwell fix pass, the review: the firebreak was optional) The way on is UP the rope (160), and the upper works' way east is sealed by a
     BROOD NEST (223). Its only fire is down here: the torch (176) lights the works' floor oil; the fire runs east and up the old pipe in the east wall
     (216) into the upper works' oil, to the nest. The rope and the drip (152) stand in the same floor oil, west of the torch: light it as it lies and the
     rope burns to ash and the drip boils dry. POUR FIRST (wet oil will not catch): a sip at the rope's foot and the fire stops there. If the rope burns:
     the scaffolds on the east wall under a spitter, or wait for a spare rope (OIL.rehang s) */
  air(141, 215, 32, F - 1);                                                   /* the lower works */
  air(150, 250, 22, 29);                                                      /* the upper works (its floor is the slab, rows 30-31) */
  air(159, 160, 30, 31); rope(160, 29, F - 1, 'works');                       /* THE ROPE UP: its foot in the oil */
  seep(142, 183, F - 1); block(184, 192, F - 1, F - 1); seep(184, 192, F - 2); seep(193, 215, F - 1); drip(152, F - 1);   /* (a step of old cistern blocks in the works floor) */
  line(215, 30, F - 2);                                                       /* THE OLD PIPE up the east wall: the floor's oil to the upper works' */
  sconce(176, F - 3, 'works');
  sign(147, F - 1, 'WET OIL WILL NOT CATCH. POUR (E) WHERE THE FIRE MUST NOT GO.');
  sign(164, F - 1, 'THE ROPE STANDS IN THE OIL. POUR AT ITS FOOT BEFORE YOU THROW THE TORCH.');
  oilS(196, F - 1, 'worksBrood'); venom(200, F - 1, 'worksBrood'); venom(204, F - 1, 'worksBrood'); venom(208, F - 1, 'worksBrood');
  tap(212, F - 1);                                                            /* TAP THREE: at the back of the brood's chamber */
  /* the long way up (if the rope burns): scaffolds up the east wall under a spitter */
  boards(208, 214, 41); boards(201, 206, 38); boards(208, 214, 35); boards(213, 215, 32); air(213, 215, 30, 31);   /* (the top board under the hole in the works' floor) */
  spitS(202, 37, 'backSpit', { face: 1 });
  /* the upper works: THE DRY FOUNTAIN and its vault, the oil, a fire scorpion on it, THE WORKS' NEST, an old oil fire */
  block(150, 155, 22, 25); vaultDoors.push({ x0: 156, x1: 156, y0: 26, y1: 29 }); block(156, 156, 22, 25); block(156, 156, 26, 29);
  ent('silver', 152, 29); interiors.push([150, 155, 26, 29, 'uwVault']);     /* THE FOUNTAIN'S VAULT: a silver */
  ent('fountain', 166, 29);
  sign(170, 29, 'THE DRY FOUNTAIN. FIND ITS THREE BRASS TAPS AND FIT THEM (E).');
  block(186, 189, 28, 29);                                                    /* a fallen cistern block on the floor */
  seep(178, 185, 29); line(185, 28, 28); seep(186, 189, 27); line(190, 28, 28); seep(190, 204, 29); block(205, 212, 29, 29); seep(205, 212, 28); seep(216, 222, 29);
  fireS(172, 29, 'worksFire'); oilS(200, 29, 'worksFire', { face: -1 }); worm(178, 29, 171, 184, 'worksWorm'); sand.push([171, 184, 30]);   /* (claude/underwell2, Daniel: worms up top too) a sandworm under the upper works' floor: its oil burning drives it under */   /* (fix pass: the fire scorpion off the oil - the works was the level's peak; the exam is now) */
  spitS(219, 29, 'worksSpit', { face: -1 });
  block(223, 224, 22, 24); nest('works', 223, 224, 25, 29);                   /* THE WORKS' NEST: its oil is the pipe's */
  block(226, 231, 22, 25); oilfire(228, 29);                                  /* an old oil fire across the low way east */
  block(240, 243, 28, 29);                                                    /* a step at the works' east end */

  // ================= 4. THE SILTED SUMP (244-350): REMIX TWO, THE BURNING GUTTER (the worms are the lock) =================
  /* (fix pass: the sump had rest mounds - the heat was optional) Five sandworms share the whole silted floor, no mound to rest on: walked cold it is
     five lunges in a row. THE BURNING GUTTER (deep oil: it burns OIL.burnDeep s) over the whole sump drives every worm under while it burns */
  air(244, 250, 22, 45);                                                      /* the drop from the upper works */
  air(251, 261, 38, 45);                                                      /* the stone sill under it, at the sump's west end */
  block(244, 261, 46, H - 1);
  ent('check', 247, 45); drip(250, 45);                                       /* CHECKPOINT TWO has no spring: a drip */
  sign(253, 45, 'TOSS THE TORCH SHORT (DOWN + ATTACK) INTO THE OIL: THE WORMS GO UNDER.');
  seep(257, 261, 45); sconce(255, 43, 'gutter'); dustS(259, 45, 'sill', { face: -1 });   /* the sill's oil and its torch - struck from the bare stone at 255-256, off the oil */
  pipe(261, 37, 44);                                                          /* the oil runs up the old pipe into the gutter */
  block(262, 335, 33, 35); block(262, 335, 37, 37); air(261, 335, 36, 36); seep(261, 335, 36);      /* SET PIECE TWO: THE BURNING GUTTER, a slot in the wall over the whole sump (too low to enter) */
  air(262, 345, 38, 45); block(262, 335, 46, H - 1); sand.push([X(262), X(335), 46]);   /* the silted floor: sand */
  worm(270, 45, 263, 276, 'sumpA', true); worm(283, 45, 277, 289, 'sumpB', true); worm(296, 45, 290, 302, 'sumpC', true); worm(309, 45, 303, 315, 'sumpD', true); worm(323, 45, 316, 331, 'sumpE', true);   /* FAST WORMS: walked cold, they catch you */
  boards(305, 309, 41); ent('silver', 307, 40);                              /* SILVER TWO: on an old board shelf over the worms (a jump from the sand) */
  block(336, 350, 43, H - 1);                                                 /* the stone rise out of the sump */

  // ================= 5. THE LAMP STAIR (351-451): THE EXAM - all of it, one oil =================
  /* (fix pass: the exam was the teach again) FLOOR A (351-368): a drip, THE ROPE UP (356) - the only way to the gallery and her door - and a torch (364)
     over one oil that runs to THE NEST (369) sealing the way east, and up a pipe into THE GUTTER over a sandworm's bed. Past the bed, THE NEST ROOM (394-405):
     the brood and THE SPRING - the gallery's two old oil fires want two sips, and the spring is the only full skin. So: POUR THE FIREBREAK at the rope's
     foot, strike the torch (the nest burns, the gutter burns, the worm goes under, the brood burn or hold back), cross, fill, come back across before the
     gutter burns out, climb, pour the two fires under a spitter. Light it as it lies and the rope is ash (a spare is lowered in OIL.rehang s) */
  air(346, 405, 33, 42); block(351, 405, 43, H - 1);
  seep(351, 368, 42); drip(352, 42); rope(356, 31, 42, 'exam'); sconce(364, 40, 'exam');
  venom(361, 42, 'floorA'); oilS(366, 42, 'floorA');                          /* brood on the oil: fight them off it while you pour, or burn them with it */
  sign(353, 42, "POUR AT THE ROPE'S FOOT, THEN THROW THE TORCH. THE SPRING IS PAST THE NEST.");
  nest('exam', 369, 370, 38, 42);                                             /* under the gutter's base: rock over it */
  sand.push([X(371), X(393), 43]); worm(382, 42, 372, 392, 'examWorm');
  block(368, 396, 33, 35); block(369, 395, 37, 37); seep(368, 396, 36); pipe(368, 37, 41); pipe(396, 37, 41);   /* the gutter over the worm bed, a pipe each end */
  /* THE NEST ROOM: the brood on its oil (the gutter's far pipe lights it: they burn, or hold back), and the spring */
  seep(394, 405, 42); spring(404, 42);
  venom(398, 42, 'nestRoom'); oilS(400, 42, 'nestRoom'); fireS(402, 42, 'nestRoom'); venom(401, 42, 'nestRoom');
  /* THE GALLERY (rows 27-31, over floor A, the gutter and the nest room) to her door */
  air(352, 442, 27, 31);
  worm(368, 31, 361, 376, 'galleryWorm'); sand.push([X(361), X(376), 32]);   /* (claude/underwell2) a sandworm on the gallery: up top as well as below */
  dustS(380, 31, 'gallery', { face: -1 }); thirstS(388, 31, 'gallery', { face: -1 }); oilS(396, 31, 'gallery', { face: -1 });
  boards(399, 403, 28); spitS(401, 27, 'gallerySpit', { face: -1 });         /* a spitter over the gallery's brood */
  ent('scorpion', 410, 31, { face: -1, elite: true, squad: 'stinger', gate: X(416) });     /* THE OLD STINGER: the brood's elite, between the gallery's brood and the fires (fix pass: the exam is the peak) */
  drip(416, 31);                                                              /* a drip after the thirsty one, before the fires */
  oilfire(420, 31); oilfire(426, 31);                                         /* two old oil fires across the gallery */
  boards(429, 433, 28); spitS(431, 27, 'examSpit', { face: -1 });            /* a spitter over the pour */
  ent('check', 438, 31); spring(442, 31);                                     /* CHECKPOINT THREE: the drowned cistern's head, a spring */

  // ================= 6. THE DROWNED CISTERN (437-532, claude/underwell2): THE THROW REMIXED, THE NEW CAST, A LONGER UNDERGROUND =================
  /* Daniel 10-06: "the underground a little longer"; oil thieves, cistern bats, drowned dead; foes toward the top. From the landing you drop into the old cistern's
     flooded hall. THE SHALLOWS: oil floats on standing water and the drowned dead lie under it - take the shore's torch and throw it on the oil: fire takes them
     (x3). THE ISLAND: a pillar's torch; the far shore's oil is past a DEEP POOL (swim it and a torch goes out) - LOB the torch over the water (UP + ATTACK) onto the
     oil before THE FAR NEST that seals the stair. CISTERN BATS roost in the dark vault over the water: carried fire scatters them, they drop on you in the dark
     (the swim). THE STAIR up to THE THIEVES' GALLERY: oil thieves throw flasks of lamp oil, their coats soaked in it (a torch on the oil under them: x2), a third
     on a high ledge (lob it), a sandworm under the gallery's silt - then her door */
  const D = 437;
  sign(D + 3, 31, 'THE DROWNED CISTERN. ITS DEAD RISE FROM THE WATER. FIRE TAKES THEM.');
  air(D + 6, D + 60, 30, 45);                                                 /* the hall (the old cistern, rows 30-45; the vault is dark) */
  boards(D + 6, D + 9, 35); boards(D + 11, D + 14, 39);                        /* the way down off the landing */
  /* THE SHALLOWS: standing water over the floor, oil floating on its far half, the drowned dead under it */
  sconce(D + 12, F - 2, 'drownA'); sign(D + 9, F + 1, 'OIL FLOATS ON THE WATER. TAKE THE TORCH (E), THROW IT ON THE OIL.');
  wade(D + 16, D + 31, F + 1); seep(D + 22, D + 31, F + 1);
  dead(D + 19, F + 1, 'shallows'); dead(D + 25, F + 1, 'shallows'); dead(D + 29, F + 1, 'shallows');
  /* THE ISLAND: a pillar to the vault, its torch; the deep pool; the far shore's oil, its brood and THE FAR NEST at the stair's door */
  block(D + 33, D + 35, 30, F - 3); sconce(D + 34, F - 2, 'drownB'); sign(D + 32, F + 1, 'LOB THE TORCH OVER THE WATER (UP + ATTACK) ONTO THE OIL BY THE NEST.');
  swim(D + 37, D + 42, F + 2, F + 6);
  bat(D + 38, 32, 'vault'); bat(D + 41, 32, 'vault'); bat(D + 45, 32, 'vault'); bat(D + 28, 32, 'vaultW');   /* CISTERN BATS in the dark vault over the water and the shallows */
  seep(D + 43, D + 48, F + 1); venom(D + 45, F + 1, 'farShore'); oilS(D + 47, F + 1, 'farShore');
  block(D + 49, D + 50, 30, F - 4); nest('drown', D + 49, D + 50, F - 3, F + 1);   /* THE FAR NEST seals the stair room's door (rock over it to the vault) */
  /* THE STAIR ROOM: boards up its height to THE THIEVES' GALLERY */
  boards(D + 52, D + 55, 43); boards(D + 57, D + 60, 40); boards(D + 52, D + 55, 37); boards(D + 57, D + 60, 34); bat(D + 54, 32, 'stair');
  /* THE THIEVES' GALLERY (rows 24-31 over its floor, row 32), out to her door: their spilled oil, a high ledge, a sandworm under the silt */
  air(D + 61, D + 95, 24, 31);
  sconce(D + 64, 29, 'gallery'); sign(D + 62, 31, 'OIL THIEVES. THEIR COATS ARE SOAKED: THROW THE TORCH ON THE OIL UNDER THEM.');
  seep(D + 67, D + 75, 31); thief(D + 71, 31, 'thievesW', { face: -1 });
  boards(D + 78, D + 82, 29); seep(D + 78, D + 82, 28); thief(D + 80, 28, 'thievesHigh', { face: -1 });
  worm(D + 88, 31, D + 84, D + 93, 'galleryWormE'); sand.push([X(D + 84), X(D + 93), 32]); thief(D + 91, 31, 'thievesE', { face: -1 });

  // ================= THE SPILLWAY and THE OLD RESERVOIR (claude/underwell3, Daniel 10-07: "he likes the WATER section with the bats and the drowned dead - TWO MORE like it") =================
  /* Drawn in TRUE columns (X is the identity while they are). THE SPILLWAY (TEACH): off the upper works' east end you drop into the old overflow - standing water,
     lamp oil floating on its far half, the drowned dead under it, bats in the dark vault; the shore's torch (on bare stone) thrown on the floating oil burns the dead
     (x3) and THE SPILLWAY NEST that seals its stair room; up the boards to the old shaft down into the sump. THE OLD RESERVOIR (TEST): off the sump's stone rise into a
     long dark reservoir; its torch hangs up in the bats' dark on a pillar at the top of three boards - carry it and they keep off - and from up there it is thrown
     onto the oil floating over four drowned dead and against THE RESERVOIR NEST that seals the Lamp Stair. Both REQUIRED (a nest seals each); glint + nudge each */
  X = TRUE;
  { const a = UW_SPILL;                                                        /* THE SPILLWAY: 244-291 */
    air(a, a + 4, 22, 27);                                                    /* the landing off the upper works' east step (you stand on row 27) */
    sign(a + 1, 27, 'THE SPILLWAY. THE DEAD LIE IN ITS WATER. FIRE ON THE OIL TAKES THEM.');
    air(a + 5, a + 44, 22, 45);                                               /* the overflow hall (rows 22-45; its vault is dark) */
    boards(a + 6, a + 9, 31); boards(a + 11, a + 14, 36); boards(a + 6, a + 9, 41);   /* the way down off the landing */
    sconce(a + 13, 42, 'spill'); sign(a + 9, 45, 'OIL FLOATS ON THE WATER. TAKE THE TORCH (E), THROW IT ON THE OIL BY THE NEST.');
    wade(a + 16, a + 33, 45); seep(a + 18, a + 33, 45);                       /* the shallows, the oil floating on them up to the nest */
    dead(a + 20, 45, 'spill'); dead(a + 28, 45, 'spill');                     /* THE DROWNED DEAD: two (the teach) */
    bat(a + 22, 26, 'spillVault'); bat(a + 30, 25, 'spillVault');             /* CISTERN BATS in its dark vault */
    block(a + 34, a + 35, 22, 40); nest('spill', a + 34, a + 35, 41, 45);     /* THE SPILLWAY NEST seals the stair room (rock over it to the vault) */
    boards(a + 36, a + 39, 43); boards(a + 41, a + 44, 40); boards(a + 36, a + 39, 37); boards(a + 41, a + 44, 34); boards(a + 36, a + 39, 31); boards(a + 41, a + 44, 28);   /* the stair room */
    air(a + 45, a + 47, 22, 27); sign(a + 46, 27, 'THE SUMP IS BELOW: DROP DOWN THE OLD SHAFT.');   /* the way out, onto the old shaft's lip (it was at the works' east end) */
  }
  { const b = UW_RES;                                                         /* THE OLD RESERVOIR: 394-437 */
    air(b, b + 43, 28, 42);                                                   /* the reservoir (rows 28-42 over the stone floor, row 43) */
    sign(b + 1, 42, 'THE OLD RESERVOIR. ITS TORCH HANGS UP IN THE BATS\' DARK. CARRY IT AND THEY KEEP OFF.');
    boards(b + 3, b + 6, 40); boards(b + 8, b + 11, 37); boards(b + 13, b + 18, 34);   /* up into the dark: three boards */
    block(b + 16, b + 17, 28, 30); sconce(b + 16, 31, 'reservoir');          /* its torch, hung under a pillar's foot over the top board */
    bat(b + 7, 30, 'resBats'); bat(b + 12, 29, 'resBats'); bat(b + 24, 30, 'resBats'); bat(b + 31, 29, 'resBats');   /* the bats' dark */
    wade(b + 20, b + 36, 42); seep(b + 21, b + 36, 42);                       /* the flooded floor, oil floating on all of it up to the nest */
    sign(b + 19, 42, 'THROW THE TORCH ON THE OIL BY THE NEST: THE DEAD RISE AS YOU WADE.');
    dead(b + 22, 42, 'resDead'); dead(b + 26, 42, 'resDead'); dead(b + 30, 42, 'resDead'); dead(b + 34, 42, 'resDead');   /* THE DROWNED DEAD: four (the test) */
    block(b + 37, b + 38, 28, 37); nest('reservoir', b + 37, b + 38, 38, 42); /* THE RESERVOIR NEST seals the Lamp Stair (rock over it) */
  }
  X = uwX;

  // ================= HER DOOR (shifted 96 east by the drowned cistern) =================
  const QF = 52, QX = 548;
  /* (claude/underwell2, Daniel 10-06 "confused where to go": a first-time walk of the route) WAY LAMPS - caged lamps on chains (no torch to take: never a verb, only a light)
     hung over each place the next step is not plain from where you stand: the works' drop to the sump, the climb out of the sump, the drop into the drowned cistern,
     the stair room's top, the shaft down to her hall. Each also has a glint and a nudge (src/stuck-spots.js) */
  for (const [x, y] of [[247, 30], [338, 39], [447, 33], [495, 31], [567, 28]]) decor.push({ kind: 'waylamp', x: X(x), y });
  decor.push({ kind: 'husk', x: X(QX - 16), y: 31 });                                 /* HER CAST SHELL, split down the back, by her door (the approach sets her up) */
  ent('check', QX - 15, 31); spring(QX - 7, 31);                              /* CHECKPOINT FOUR: her door, a spring */
  air(QX - 16, QX + 26, 27, 31);                                              /* the corridor over her hall */
  sign(QX - 4, 31, "THE QUEEN'S CISTERN. FIRE ON HER FLOOR DRIVES HER UP; WATER OPENS HER.");

  // ================= THE QUEEN'S CISTERN (src/cistern-queen.js) =================
  const queen = stageCisternQueen({ set: L.set, block: L.block, ent: L.ent, air: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) L.set(x, y, T.AIR); } }, T, TS, X(QX), QF, 32);   /* (her stage takes true columns) */
  for (const n of queen.ladders) ropes.push([n[0], n[1], n[2], null]);
  /* her own composed theme (src/boss-music.js 'cisternqueen', its p2/p3 voicings by phase): Daniel 10-05 - the Djinn has his own now */
  interiors.push([X(QX), X(QX + 39), QF - 15, QF - 1, 'uwQueen'], [X(QX + 17), X(QX + 22), QF, QF + 1, 'uwQueen']);
  /* (fix pass: THE QUEEN GETS THE LEVEL'S RULE) Lamp oil in her hall: a streak down each wall under the ledges (she climbs through it in phase two and it
     burns with her - drawn), and a pool on the floor either side with a torch over it: struck, the floor burns, and her brood will not cross it */
  const qlr = QF - 8;
  line(QX, qlr + 2, QF - 1); line(QX + 39, qlr + 2, QF - 4); block(QX + 39, QX + 39, QF - 3, QF - 3);   /* (claude/underwell2: a streak rests on what it runs down to - the west one on her floor, the east one on the lip of the outflow's arch) */
  seep(QX + 8, QX + 13, QF - 1); seep(QX + 26, QX + 31, QF - 1); sconce(QX + 10, QF - 4, 'queenW'); sconce(QX + 29, QF - 4, 'queenE');   /* (claude/underwell2: taken from the floor and THROWN - onto a pool her burrow will cross: the fire drives her up, open) */
  air(QX + 40, QX + 50, QF - 3, QF - 1); ent('gate', QX + 48, QF - 1);                    /* the old outflow: the road out, to THE RED GORGE */

  // ================= THE ROPES, LAST =================
  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) L.set(x, y, T.NET);   /* (true columns) */

  const START = { x: 5, y: 6 };
  return {
    W: UNDERWELL.W, H, grid: L.grid, ents: L.ents, START, pools, falls: [], moversExtra: [], interiors,
    arena: queen.arena, gateAfterBoss: true,
    underwell: true, skinRule: true,   /* skinRule: THE WELL TOWN's skin works here (src/well-town-hands.js: fill, pour, the old oil fires) */
    seeps, lines, nests, sand, vaultDoors, decor,
    queenOil: { W: [X(QX), qlr + 2, QF - 1], E: [X(QX + 39), qlr + 2, QF - 4] },   /* the streaks of lamp oil down her hall's walls: they burn while she clings there alight (src/underwell-hands.js) */
    ropes: ropes.filter(r => r[3]).map(([x, y0, y1, id]) => ({ x, y0, y1, id })),   /* the ropes that burn (the hands hang them again on a respawn) */
    /* underground: no sun reaches the floor anywhere (the whole level is shade, as the Red Gorge's canyon); LIGHT is the look, not a rule */
    shade: [[0, UNDERWELL.W * TS, 0, H * TS + 1]], shadeArt: [],
    rockZones: [[0, UNDERWELL.W - 1, 0, H - 1]],
    quest: { n: 3, item: 'tap', name: 'TAPS', done: 'THREE TAPS: FIT THEM TO THE DRY FOUNTAIN', thanks: 'THE FOUNTAIN RUNS' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, UNDERWELL.W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 240,                  /* (claude/underwell3: 200 -> 240 - the water sections lengthen two runs: the sump's shaft to the drowned cistern's head is 235) four checkpoints (Daniel: fewer; claude/underwell2 added the drowned cistern's head); src/level.js checkpoints() must not fill between them */
    unlocks: [
      { kind: 'stray', opens: "THE DRY FOUNTAIN's vault (a silver) once all three taps are fitted - and the fountain runs from then on (a spring)", hud: 'TAPS n/3 (the quest counter); at the fountain: THE DRY FOUNTAIN WANTS THREE BRASS TAPS' },
      { kind: 'fountain', opens: "its vault (a silver), and it is a spring from then on", hud: 'THE FOUNTAIN RUNS: ITS VAULT OPENS' },
      { kind: 'sconce', opens: 'its torch (E takes it, ATTACK throws it in a told arc): the oil where it lands burns - a brood nest burns away, a worm goes under, the brood hold back, the drowned dead burn', hud: 'THE OIL CATCHES' },
      { kind: 'greatlamp', opens: "the brood hall's oil, the whole floor at once", hud: 'THE GREAT LAMP FALLS: THE HALL BURNS' },
      { kind: 'nestplug', opens: 'the tunnel it seals (fire takes it)', hud: 'THE NEST BURNS AWAY' },
      { kind: 'skinwell', opens: 'your skin: a spring fills it, a drip gives one sip', hud: 'YOUR SKIN IS FULL: E POURS, E DRINKS' },
      { kind: 'oilfire', opens: 'the way it burns across (a pour)', hud: 'THE FIRE IS OUT - GO' },
    ],
    music: 'underwell',   /* (its boss room: arena.music, set below the stage) */   /* "Ossuary 6 - Air" by Kevin MacLeod, CC-BY 4.0 (Daniel's pick; src/audio.js, audio/CREDITS.txt) */
    ambient: [{ x0: 0, x1: 99999, kind: 'cistern' }],   /* (claude/underwellart) its own bed: drips, a far skitter, oil in a pipe (src/audio.js SYNTH_BEDS.cistern) */
    caravan: true,   /* the desert's hands in main.js (the scorpions' and the worms' machines); the sun never reaches down here (the shade above) */
    /* (claude/underwellart) THE LOOK: a dark level, as the Ore Road's mine is - black with a hole for every torch, every burning cell, the lamp and the light you carry; a warm dark, the
       lamps' own amber laid into their pools, warm-lit creatures, and a lit lip on every edge you can stand on. The tile kit, the backdrop and the rooms are src/redraw/underwell_*.js */
    dark: 0.3, edgeLit: 'rgba(255,214,150,0.55)',
    palette: { set: 'desert', near: 'none', dress: 'none', noFg: true, noNear: true, haze: 'rgba(30,18,10,0.08)', murkCol: '#2a1f18', murkLit: '#6a4a2a',
      darkCol: '12,8,5', lampGlow: [255, 160, 70, 0.26], darkRim: ['#c8904a', 0.26, 0.12], footLip: ['#e8c080', 0.5] },
    duskStart: -1, duskLen: 1,
  };
}
