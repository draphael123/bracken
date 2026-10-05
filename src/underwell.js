// src/underwell.js - THE UNDERWELL, desert arc level 3 (claude/underwell, the GREYBOX: geometry, the oil rule, the machines, the encounters,
// the wiring). Concept: docs/concepts/the-underwell.md (Daniel's 10-03 concept: the old cistern tunnels under THE WELL TOWN, dried when the
// Djinn's well took the water; scorpions nested in the dark; lamp oil seeping out of the old works). Main road: welltown > UNDERWELL > redgorge.
//
// THE RULE: OIL SEEPS DOWN HERE. A TORCH STRUCK DOWN INTO IT SETS IT BURNING, THE BROOD WILL NOT CROSS FIRE, AND ONLY YOUR WATER PUTS IT OUT.
// The verbs: LIGHT (strike a wall torch, or THE GREAT LAMP's chain: it falls into the oil) and POUR (the Well Town's skin: a fire goes out, and oil
// poured BEFORE it burns is WET and will not catch - a firebreak). src/underwell-hands.js keeps the oil's state per cell (oil / burning / wet /
// spent) and draws it: a black sheen, running flames, dark wet stone, burnt black. A lit cell burns OIL.burn s, then is spent; wet oil dries and
// spent oil seeps back after OIL.back s (nothing is lost for good: no softlock). Fire burns a BROOD NEST away (the plugs that seal the tunnels),
// boils a DRIP dry, burns a rope ladder to ash (it is hung again on a respawn), drives a SANDWORM under, and holds the brood back.
//
// THE THEMED KEY: three BRASS TAPS (the old well-keeper's: L.quest). Fitted to THE DRY FOUNTAIN in the oil works, water runs: it is a spring from then
// on, and its vault opens (a silver). The HUD counts them (TAPS n/3).
//
// FIVE SECTIONS (columns; the floor is mostly row 44, the oil works' upper floor row 30, the sump's sand row 46):
//   0-44     THE DRY WELL      TEACH light, pour    down the dry well's shaft; at its foot a BROOD NEST seals the tunnel over the oil, and a torch hangs
//                                                   over it; then an OLD OIL FIRE and a drip in front of it
//   45-140   THE BROOD HALL    TEST + SET PIECE 1   a pillared cistern: THE GREAT LAMP hangs over the hall's oil on a chain (from the gallery: strike it -
//                                                   the whole floor burns); the brood chamber at its east end and the nest behind it (its own torch)
//   141-250  THE OIL WORKS     REMIX: firebreak     the rope up is ON the oil, and the torch for the brood chamber is past it: pour first, then light; the
//                                                   upper works: THE DRY FOUNTAIN (the vault), a fire scorpion on the oil, an oil fire across the way
//   244-350  THE SILTED SUMP   REMIX + SET PIECE 2  sandworm floors under THE BURNING GUTTER: light it and the fire runs the length of the sump over the
//                                                   worms - the heat drives them under while it burns: cross then
//   351-446  THE LAMP STAIR    EXAM                 one connected oil: a drip, a torch, the gutter over a worm bed, a nest, the brood behind it, two oil
//                                                   fires, a spitter - then the stair to the Queen's door
//   452-491  THE QUEEN'S CISTERN  BOSS              THE CISTERN QUEEN (src/cistern-queen.js stageCisternQueen, her code as WELLTOWN5 benched it)
import { stageCisternQueen } from './cistern-queen.js';

export const UNDERWELL = { W: 508, H: 60, floor: 44 };
export const SECTIONS = [['THE DRY WELL', 0], ['THE BROOD HALL', 45], ['THE OIL WORKS', 141], ['THE SILTED SUMP', 244], ['THE LAMP STAIR', 351], ["THE QUEEN'S CISTERN", 447]];
/* each verb's arc (tile columns) - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/underwell.mjs and the concept page */
export const ARCS = {
  light: { teach: [15, 23], test: [78, 132], remix: [150, 214], twist: [252, 335], exam: [351, 400] },   /* the shaft's nest; the great lamp; the brood chamber past the rope; the gutter; all of it */
  pour: { teach: [26, 34], test: [140, 160], remix: [150, 180], exam: [351, 430] },                      /* the old oil fire; the drip and the spring; the firebreak; the break + two fires */
  brood: { teach: [118, 132], remix: [195, 214], exam: [400, 418] },                                      /* they will not cross fire */
  worm: { teach: [262, 335], exam: [373, 393] },                                                          /* the heat drives them under */
};

export function buildUnderwell({ painter, T, TS }) {
  const { W, H } = UNDERWELL, F = UNDERWELL.floor;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const boards = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const ropes = []; const rope = (x, y0, y1, id) => ropes.push([x, y0, y1, id || null]);   /* every rope is hung LAST, over what is carved */
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
  const worm = (x, y, b0, b1, squad) => ent('sandworm', x, y, { squad, bed: [b0, b1] });
  /* THE OIL (src/underwell-hands.js): seeps = [x0, x1, row] runs of cells (a cell is the air over a floor: a hero standing there stands in it), lines =
     [x, row0, row1] the oil running down a wall or a pipe (fire climbs them). nests = the brood's plugs (solid, the blade turns off them; fire takes them) */
  const seeps = [], lines = [], nests = [], decor = [], interiors = [], vaultDoors = [], sand = [];
  const seep = (x0, x1, y) => seeps.push([x0, x1, y]);
  const line = (x, y0, y1) => lines.push([x, y0, y1]);
  const nest = (id, x0, x1, y0, y1) => { block(x0, x1, y0, y1); nests.push({ id, x0, x1, y0, y1 }); ent('nestplug', x0, y1, { id, x1 }); };
  const sconce = (x, y, id) => ent('sconce', x, y, { id });   /* a wall torch: struck, it falls straight down into the oil under it */
  const drip = (x, y) => ent('skinwell', x, y, { jar: true, sips: 1, drip: true });   /* A DRIP: one sip a life (fire boils it dry) */
  const spring = (x, y) => ent('skinwell', x, y, { spring: true });                 /* A SPRING: a full skin (at the checkpoints) */
  const oilfire = (x, y) => ent('oilfire', x, y, { barricade: true });                /* AN OLD OIL FIRE: a wall of fire until a pour puts it out */
  const tap = (x, y) => ent('stray', x, y, { kind: 'tap' });

  // ================= THE ROCK =================
  block(0, W - 1, 0, H - 1);

  // ================= 1. THE DRY WELL (0-44): down the shaft, a nest, an oil fire =================
  air(3, 14, 3, F - 1);
  boards(3, 9, 7); sign(8, 6, 'THE UNDERWELL. THE OIL DOWN HERE BURNS. WATER IS ALL YOU CARRY.');
  boards(9, 14, 12); boards(3, 8, 17); boards(9, 14, 22); boards(3, 8, 27); boards(9, 14, 32); boards(3, 8, 37);
  drip(4, 26);                                                                /* the first drip, on the way down: a sip before anything asks for one */
  tap(3, 36);                                                                 /* TAP ONE: at the end of the last ledge */
  air(15, 44, 39, F - 1);                                                     /* the tunnel east (five rows) */
  seep(17, 23, F - 1); sconce(17, F - 3, 'shaft');                           /* THE FIRST LESSON: the oil under the nest, the torch over it */
  nest('shaft', 21, 22, 39, F - 1);                                           /* the brood's nest seals the tunnel (rock over it) */
  sign(13, F - 1, 'A BROOD NEST. FIRE TAKES IT. STRIKE THE TORCH DOWN INTO THE OIL.');
  block(24, 28, F - 1, F - 1); drip(26, F - 2);                              /* a step of fallen blocks, the drip on it */
  sign(29, F - 1, 'AN OLD OIL FIRE. ONLY WATER PUTS IT OUT: E POURS YOUR SKIN.');
  oilfire(33, F - 1);
  venom(40, F - 1, 'tunnelBrood');                                           /* the first of the brood, past the fire (the hall is theirs) */

  // ================= 2. THE BROOD HALL (45-140): THE GREAT LAMP; the brood chamber; the nest =================
  air(45, 131, 24, F - 1);
  block(58, 59, 41, F - 1); block(100, 101, 41, F - 1);                       /* fallen pillar drums on the floor (three rows: a hop) */
  boards(61, 67, 38); boards(69, 75, 35); boards(77, 85, 32);                 /* up to THE LAMP GALLERY (a row of old scaffold boards, a hop apart) */
  ent('greatlamp', 87, 31, { top: 24 });                                      /* SET PIECE ONE: THE GREAT LAMP on its chain over the hall's oil (strike the chain from the gallery) */
  sign(80, 31, 'THE GREAT LAMP. ITS CHAIN IS RUSTED THROUGH.');
  /* the hall's oil: the floor, over the drums (their faces and tops), to the nest at the east end */
  seep(46, 57, F - 1); line(57, 40, F - 2); seep(58, 59, 40); line(60, 40, F - 2); seep(60, 63, F - 1); block(64, 75, F - 1, F - 1); seep(64, 75, F - 2); seep(76, 83, F - 1); block(84, 92, F - 1, F - 1); seep(84, 92, F - 2); seep(93, 99, F - 1); line(99, 40, F - 2);   /* (the hall floor rises a step in two places: the oil runs up them) */ seep(100, 101, 40); line(102, 40, F - 2); seep(102, 131, F - 1);
  dustS(94, F - 1, 'hallDust', { face: -1 }); venom(67, F - 2, 'hallStep', { face: -1 }); thirstS(71, F - 2, 'hallStep', { face: -1 });   /* on the hall's first step: the brood, and one that smells your water */                                 /* a dust scorpion on the hall floor */
  boards(103, 107, 38); spitS(105, 37, 'hallSpit', { face: -1 });             /* a spitter on a drum's scaffold, over the floor and the gallery */
  boards(110, 115, 35);
  /* THE BROOD CHAMBER: a low vault at the hall's east end, the nest at its back */
  block(118, 131, 34, 38);
  venom(120, F - 1, 'brood', { face: -1 }); venom(123, F - 1, 'brood'); venom(126, F - 1, 'brood'); venom(129, F - 1, 'brood');
  sconce(124, F - 3, 'chamber');                                              /* the chamber's own torch (the lamp's fire reaches the nest too) */
  block(132, 140, 24, 38); nest('hall', 132, 133, 39, F - 1);
  ent('silver', 125, 33); tap(129, 33);                                       /* SILVER ONE and TAP TWO on the chamber's roof (from the spitter's scaffold) */
  interiors.push([118, 131, 39, F - 1, 'uwChamber']);
  air(134, 149, 39, F - 1);
  ent('check', 137, F - 1); spring(141, F - 1);                               /* CHECKPOINT ONE, and a spring: a full skin */

  // ================= 3. THE OIL WORKS (141-250): the rope on the oil; the upper works =================
  air(141, 215, 32, F - 1);                                                   /* the lower works */
  air(150, 250, 22, 29);                                                      /* the upper works (its floor is the slab, rows 30-31) */
  air(159, 160, 30, 31); rope(160, 29, F - 1, 'works');                       /* THE ROPE UP: its foot in the oil */
  seep(142, 183, F - 1); block(184, 192, F - 1, F - 1); seep(184, 192, F - 2); seep(193, 214, F - 1); drip(152, F - 1);   /* (a step of old cistern blocks in the works floor) */
  sconce(176, F - 3, 'works');
  fireS(167, F - 1, 'ropeFire', { face: -1 });                               /* A FIRE SCORPION BY THE ROPE: its sting lights the oil the rope stands in (wet it, or kill it off the oil) */                                                /* the torch for the brood chamber - east of the rope */
  sign(147, F - 1, 'WET OIL WILL NOT CATCH. POUR WHERE THE FIRE MUST NOT GO.');
  oilS(196, F - 1, 'worksBrood'); venom(200, F - 1, 'worksBrood'); venom(204, F - 1, 'worksBrood'); venom(208, F - 1, 'worksBrood');
  tap(212, F - 1);                                                            /* TAP THREE: at the back of the brood's chamber */
  /* the long way up (if the rope burns): scaffolds up the east wall under two spitters */
  boards(208, 214, 41); boards(201, 206, 38); boards(208, 214, 35); boards(213, 215, 32); air(213, 215, 30, 31);   /* (the top board under the hole in the works' floor) */
  spitS(202, 37, 'backSpit', { face: 1 });
  /* the upper works: THE DRY FOUNTAIN and its vault, the oil, a fire scorpion on it, an old oil fire */
  block(150, 155, 22, 25); vaultDoors.push({ x0: 156, x1: 156, y0: 26, y1: 29 }); block(156, 156, 22, 25); block(156, 156, 26, 29);
  ent('silver', 152, 29); interiors.push([150, 155, 26, 29, 'uwVault']);     /* THE FOUNTAIN'S VAULT: a silver */
  ent('fountain', 166, 29);
  sign(170, 29, 'THE DRY FOUNTAIN. ITS BRASS TAPS WERE TAKEN DOWN.');
  block(186, 189, 28, 29);                                                    /* a fallen cistern block on the floor */
  seep(178, 185, 29); line(185, 27, 28); seep(186, 189, 27); line(190, 27, 28); seep(190, 204, 29); block(205, 212, 29, 29); seep(205, 212, 28); seep(216, 222, 29);
  fireS(194, 29, 'worksFire'); oilS(200, 29, 'worksFire', { face: -1 });
  spitS(219, 29, 'worksSpit', { face: -1 });
  block(226, 231, 22, 25); oilfire(228, 29);                                  /* an old oil fire across the low way east */
  block(240, 243, 28, 29);                                                    /* a step at the works' east end */

  // ================= 4. THE SILTED SUMP (244-350): THE BURNING GUTTER over the worm floors =================
  air(244, 250, 22, 45);                                                      /* the drop from the upper works */
  air(251, 261, 38, 45);                                                      /* the stone sill under it, at the sump's west end */
  block(244, 261, 46, H - 1);
  ent('check', 247, 45); drip(251, 45); dustS(253, 45, 'sill', { face: -1 });   /* CHECKPOINT TWO has no spring: a drip (the exam's water is scarce) */                                                      /* CHECKPOINT TWO: at the sump's foot */
  seep(255, 261, 45); sconce(257, 43, 'gutter');                             /* the sill's oil, its torch */
  line(261, 37, 44);                                                          /* the oil runs up the old pipe into the gutter */
  block(262, 335, 33, 35); block(262, 335, 37, 37); air(261, 335, 36, 36); seep(261, 335, 36);      /* SET PIECE TWO: THE BURNING GUTTER, a slot in the wall over the whole sump (too low to enter) */
  air(262, 345, 38, 45); block(262, 335, 46, H - 1); sand.push([262, 335, 46]);   /* the silted floor: sand */
  sign(252, 45, 'THE OLD GUTTER RUNS THE LENGTH OF THE SUMP.');
  worm(272, 45, 264, 283, 'sumpA'); worm(295, 45, 287, 305, 'sumpB'); worm(318, 45, 309, 330, 'sumpC');
  block(284, 286, 44, 45); block(306, 308, 44, 45);                         /* two mounds of silt between the worms' beds (rest stops: no worm leaves its bed) */
  thirstS(299, 45, 'sumpThirst', { face: -1 }); dustS(326, 45, 'sumpDust', { face: -1 });
  ent('silver', 307, 43);                                                     /* SILVER TWO: on the far island */
  block(336, 350, 43, H - 1);                                                 /* the stone rise out of the sump */
  ent('scorpion', 343, 42, { face: -1, elite: true, squad: 'stinger' });     /* THE OLD STINGER: the brood's elite, at the sump's mouth */

  // ================= 5. THE LAMP STAIR (351-446): the exam, then the stair to her door =================
  air(346, 430, 28, 42); block(351, 430, 43, H - 1);
  seep(351, 372, 42); drip(352, 42); sconce(359, 40, 'exam');   /* (the torch near the drip: the oil between them is the firebreak's - and the run east to the bed is long) */                /* the drip on the oil, the torch east of it */
  block(373, 393, 43, H - 1); sand.push([373, 393, 43]); worm(383, 42, 374, 392, 'examWorm');
  block(368, 396, 33, 35); block(369, 395, 37, 37); seep(368, 396, 36); line(368, 37, 41); line(396, 37, 41);   /* the gutter over the worm bed, a pipe each end */
  spitS(382, 32, 'examSpit', { face: -1 });                                   /* on the gutter's roof */
  seep(394, 397, 42);
  block(398, 430, 28, 37); nest('exam', 398, 399, 38, 42);                    /* the nest under the stair's foot */
  venom(404, 42, 'examBrood'); thirstS(408, 42, 'examBrood'); fireS(410, 42, 'examBrood'); venom(412, 42, 'examBrood'); oilS(415, 42, 'examBrood');   /* (the fire scorpion is at home in the burning room - and its sting lights the oil again) */
  seep(398, 416, 42);                                                         /* the brood's room is oiled too (the oil runs under the nest): the nest's fire runs in on them (and on whoever walks in while it burns) */
  drip(418, 42); oilfire(420, 42); oilfire(426, 42);                         /* a drip (off the oil) before two old oil fires (the thirsty one is after your water) */
  /* the stair up to her door */
  air(431, 446, 26, 42); block(431, 434, 40, 42); block(435, 438, 37, 42); block(439, 451, 34, 42);
  oilS(436, 36, 'stair', { face: -1 });
  ent('check', 442, 33); spring(445, 33);                                     /* CHECKPOINT THREE: her door, a spring */
  air(439, 478, 29, 33);                                                      /* the corridor over her hall */
  sign(448, 33, "THE QUEEN'S CISTERN. DOWN THE OLD SHAFT.");

  // ================= THE QUEEN'S CISTERN (src/cistern-queen.js) =================
  const QF = 52;
  const queen = stageCisternQueen({ set, block, ent, air }, T, TS, 452, QF, 34);
  for (const n of queen.ladders) rope(n[0], n[1], n[2], null);
  queen.arena.music = 'boss3';   /* GREYBOX: a pool boss track - her own composed theme ('cisternqueen') is the Djinn's now (claude/welltown5); a question for Daniel */
  interiors.push([452, 491, QF - 15, QF - 1, 'uwQueen'], [469, 474, QF, QF + 1, 'uwQueen']);
  air(492, 505, QF - 6, QF - 1); ent('gate', 502, QF - 1);                    /* the old outflow: the road out, to THE RED GORGE */

  // ================= THE ROPES, LAST =================
  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  const START = { x: 5, y: 6 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: [], interiors,
    arena: queen.arena, gateAfterBoss: true,
    underwell: true, skinRule: true,   /* skinRule: THE WELL TOWN's skin works here (src/well-town-hands.js: fill, pour, the old oil fires) */
    seeps, lines, nests, sand, vaultDoors, decor,
    ropes: ropes.filter(r => r[3]).map(([x, y0, y1, id]) => ({ x, y0, y1, id })),   /* the ropes that burn (the hands hang them again on a respawn) */
    /* underground: no sun reaches the floor anywhere (the whole level is shade, as the Red Gorge's canyon); LIGHT is the look, not a rule */
    shade: [[0, W * TS, 0, H * TS + 1]], shadeArt: [],
    rockZones: [[0, W - 1, 0, H - 1]],
    quest: { n: 3, item: 'tap', name: 'TAPS', done: 'THREE TAPS: FIT THEM TO THE DRY FOUNTAIN', thanks: 'THE FOUNTAIN RUNS' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,                  /* three checkpoints (Daniel: fewer); src/level.js checkpoints() must not fill between them */
    unlocks: [
      { kind: 'stray', opens: "THE DRY FOUNTAIN's vault (a silver) once all three taps are fitted - and the fountain runs from then on (a spring)", hud: 'TAPS n/3 (the quest counter); at the fountain: THE DRY FOUNTAIN WANTS THREE BRASS TAPS' },
      { kind: 'fountain', opens: "its vault (a silver), and it is a spring from then on", hud: 'THE FOUNTAIN RUNS: ITS VAULT OPENS' },
      { kind: 'sconce', opens: 'the oil under it (it burns): a brood nest burns away, a worm goes under, the brood hold back', hud: 'THE OIL CATCHES' },
      { kind: 'greatlamp', opens: "the brood hall's oil, the whole floor at once", hud: 'THE GREAT LAMP FALLS: THE HALL BURNS' },
      { kind: 'nestplug', opens: 'the tunnel it seals (fire takes it)', hud: 'THE NEST BURNS AWAY' },
      { kind: 'skinwell', opens: 'your skin: a spring fills it, a drip gives one sip', hud: 'YOUR SKIN IS FULL: E POURS, E DRINKS' },
      { kind: 'oilfire', opens: 'the way it burns across (a pour)', hud: 'THE FIRE IS OUT - GO' },
    ],
    music: 'cave',   /* (its boss room: arena.music, set below the stage) */   /* GREYBOX PLACEHOLDER: the cave track until Daniel picks a CC0/CC-BY track for the art pass */
    ambient: [{ x0: 0, x1: 99999, kind: 'cave' }],
    caravan: true,   /* the desert's hands in main.js (the scorpions' and the worms' machines); the sun never reaches down here (the shade above) */
    ledgeKit: 'desert',
    palette: { set: 'desert', near: 'none', dress: 'desert', noFg: true, noNear: true, haze: 'rgba(40,24,12,0.30)' },
    duskStart: -1, duskLen: 1,
  };
}
