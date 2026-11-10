/* src/academy.js - THE MAGE ACADEMY (claude/academy, the OPUS GREYBOX; scratch/brief-academy-1016.md, Daniel 10-16; behind ACADEMY_SHIPS, src/ac-flag.js).
   Road: THE WITCHLIGHT STAIR -> THE MAGE ACADEMY -> THE MAGE'S FOLLY. The archmage's school at the foot of his tower; ~60% of a full level.
   RULE: 'THE LESSONS ARE STILL BEING TAUGHT. LEARN THE SPELL AT THE LECTERN; IT LASTS THE LESSON.'
   THE VERB - BORROWED CANTRIPS (src/academy-hands.js runs them): a room's LECTERN teaches every hero the same spell (fair for all classes); it lasts while he
   stays in that room, and another lectern swaps it. No new buttons:
     LEVITATION     (THE LIBRARY)            hold JUMP in the air: float up (LEV.meter s per airtime, refilled on landing)
     BLINK          (THE LECTURE HALL)       the DODGE button: a short teleport the way you face - through WARD RAILS of light and over gaps, never through stone
     CONJURE STEP   (THE CONJURATION YARD)   JUMP in the air: a glowing step under your feet (it lasts a moment, flickers first); chain them over the drop
   NOT here (the brief): glyph floor-flipping (Witchlight / the Folly), potions (Underleaf 3), the orrery (the Undead Mage).
   SECTIONS (columns):   0-17  THE ACADEMY STEPS               the arrival from the Stair, the rule
                        18-99  THE LIBRARY           TEACH     levitation: stacks up to the reading gallery (the exit is up there); the archive pit; SPELLBOOK FLOCKS
                       100-179 THE LECTURE HALL      DEVELOP   blink: tiered benches, ward rails, apprentice duels behind them, the orchestra pit; SHRINE ONE
                       180-249 THE CONJURATION YARD  TWIST     conjure step: the summoning well (a wide drop), floating stones; the cellar silver
                       250-299 THE EXAM HALL         EXAM      three lecterns in quick succession (levitate a wall, blink a rail, conjure a gap); SHRINE TWO
                       300-339 THE EXAMINATION       BOSS      THE HEADMISTRESS'S FINAL EXAM (src/headmistress.js)
   THE PITS (the archive, the orchestra pit, the summoning well, the exam gap) have no floor: a hero whose feet pass ac.catchY is filed back onto the last firm
   footing for 14 (spare: never a death - Daniel's fewer checkpoints make a death-pit school harsh; Q in the report).
   CHECKPOINTS (Daniel: fewer): START + 2 shrines (cols 172 and 296). L.checkRun 200: the filler adds none. Placed wholly by hand (calm: nothing sprinkled).
   REACH: each cantrip room is a ride band (L.rigBands) for src/reachcore.js, as a fly line is: the spell carries you anywhere in it (tools/academy.mjs proves the
   hands really do: a float clears the library's gallery, a blink the rails, a chain of steps the well).
   GRID: 340 x 48; the floor is row 40 (stand on row 39). No goblins (after the Goblin Queen): apprentices, brooms, armour, imps, bats - and the one new foe. */
import { AC_RULE, AC_SAY } from './ac-lines.js';

export const AC = {
  W: 340, H: 48, F: 40,
  catchY: 45 * 16,              /* px: a hero whose feet pass this line is in a pit (filed back) */
  arena: { x0: 301, x1: 338, wallL: 300, wallR: 339, trigger: 304, floor: 40, gallery: 30, pit: [[312, 327], [306, 333]], ledges: [[301, 305], [334, 338]] },
};
export const SECTIONS = [['THE ACADEMY STEPS', 0, 18], ['THE LIBRARY', 18, 100], ['THE LECTURE HALL', 100, 180], ['THE CONJURATION YARD', 180, 250], ['THE EXAM HALL', 250, 300], ['THE EXAMINATION', 300, 340]];

export function buildAcademy({ painter, T, TS }) {
  const { W, H, F } = AC;
  const L = painter(W, H), { set, ent } = L;
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const ground = (x0, x1, top) => fill(x0, x1, top, H - 1, T.SOLID);
  const stack = (x0, x1, top) => fill(x0, x1, top, F - 1, T.SOLID);              /* a BOOKSTACK: shelves from the floor up (grounded) */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const foe = (t, x, y, squad, o = {}) => ent(t, x, y, { squad, ...o });
  const rooms = [], lecterns = [], rails = [], wells = [], runes = [], rigBands = [], hull = [];
  const room = (id, spell, x0, x1) => { rooms.push({ id, spell, x0, x1 }); };
  /* A LECTERN: touch it (or strike it) and its spell is yours for the room. arena: lit by the Headmistress, one phase at a time */
  const lectern = (x, y, spell, rm, o = {}) => { const c = { id: 'lc' + lecterns.length, x: x * TS + 8, y: (y + 1) * TS, col: x, row: y, spell, room: rm, arena: !!o.arena }; lecterns.push(c); ent('aclectern', x, y, { id: c.id, spell }); return c; };
  /* A WARD RAIL of light: a column of SOLID from y0 to y1 (floor to ceiling); feet stop at it, a blink passes it */
  const rail = (x, y0, y1) => { fill(x, x, y0, y1, T.SOLID); const r = { id: 'rl' + rails.length, x, y0, y1 }; rails.push(r); ent('acrail', x, y1, { id: r.id, h: y1 - y0 + 1 }); return r; };
  /* A PIT with no floor (filed back, 14) */
  const well = (x0, x1, name) => { fill(x0, x1, F, H - 1, T.AIR); wells.push({ x0, x1, name }); ent('acwell', x0, F - 1, { w: x1 - x0 + 1, name }); };
  /* A SHORTCUT RUNE: struck, its shutter (these cells, SOLID until then) lifts - into a cellar or an alcove that pays */
  const rune = (x, y, cells) => { const r = { id: 'rn' + runes.length, x: x * TS + 8, y: (y + 1) * TS, col: x, row: y, cells }; runes.push(r); ent('acrune', x, y, { id: r.id }); return r; };
  const ride = (x0, x1, y0, y1) => rigBands.push([x0, x1, y0, y1]);

  // ================= 0. THE ACADEMY STEPS (0-17) =================
  ground(0, 11, F); ground(12, 17, F - 1);
  sign(3, F - 1, AC_SAY.start); sign(8, F - 1, AC_SAY.rule);
  foe('apprentice', 15, F - 2, 'stepsPupil', { face: -1 });
  coins([6, F - 1], [10, F - 1]);

  // ================= 1. THE LIBRARY (18-99): TEACH - LEVITATION =================
  room('library', 'levitate', 18, 99);
  ground(18, 99, F); fill(18, 99, 0, 13, T.SOLID);                                  /* the library's ceiling: a tall hall of stacks */
  lectern(22, F - 1, 'levitate', 'library'); sign(20, F - 1, AC_SAY.library);
  stack(27, 29, 36); stack(34, 36, 33); stack(41, 43, 30); fill(44, 56, 30, 30, T.SOLID);   /* THE STACKS, each higher, to THE READING GALLERY (a shelf off the third stack) */
  coins([28, 35], [35, 32], [42, 29], [48, 29], [52, 29]);
  foe('apprentice', 38, F - 1, 'libPupil', { face: -1 });
  foe('acflock', 50, 24, 'libFlock');                                              /* THE FIRST FLOCK, over the gallery */
  sign(57, F - 1, AC_SAY.archive); well(58, 67, 'THE ARCHIVE');                     /* THE ARCHIVE PIT: float over it (or ride the reading desk) */
  ent('mover', 59, 34, { len: 3, range: 5, speed: 30 });                           /* A DRIFTING READING DESK over the pit */
  stack(70, 72, 20); ent('silver', 71, 19); coins([71, 18]);                       /* SECRET ONE: the top shelf of the tallest stack (float to it from the desk / the next stack) */
  stack(76, 78, 28); coins([77, 27]);
  foe('broom', 74, F - 1, 'libBroom', { face: -1 }); foe('acflock', 80, 22, 'libFlock2');
  sign(68, F - 1, AC_SAY.flock);
  stack(82, 83, 35); fill(86, 95, 30, 30, T.SOLID);                                 /* the landing shelf by the door */
  fill(96, 99, 14, F - 1, T.SOLID); fill(96, 99, 27, 29, T.AIR);                    /* THE EAST WALL: the only way on is the high door (rows 27-29) */
  foe('armour', 90, F - 1, 'libArmour', { face: -1 });
  fill(97, 98, 37, 39, T.AIR); coins([97, 39], [98, 39], [98, 38]);                /* THE CARREL: an alcove in the east wall's foot ... */
  rune(93, F - 1, [[96, 37], [96, 38], [96, 39]]);                                  /* ... behind a shutter its rune lifts */
  ride(23, 95, 18, 39);                                                             /* LEVITATION (the reach model's ride band) */

  // ================= 2. THE LECTURE HALL (100-179): DEVELOP - BLINK =================
  room('lecture', 'blink', 100, 179);
  fill(100, 179, 0, 26, T.SOLID);                                                   /* the hall's ceiling: the rails run floor to ceiling */
  ground(100, 107, 30); lectern(104, 29, 'blink', 'lecture'); sign(101, 29, AC_SAY.lecture);
  ground(108, 111, 32); ground(112, 115, 34); ground(116, 119, 36); ground(120, 123, 38);   /* THE TIERED BENCHES, down to the lecture floor */
  coins([110, 31], [114, 33], [118, 35]);
  ground(124, 149, F); foe('imp', 121, 30, 'benchImp');
  sign(126, F - 1, AC_SAY.duel);
  rail(130, 27, F - 1);                                                             /* RAIL ONE: blink through */
  foe('apprentice', 135, F - 1, 'duel', { face: 1 }); foe('apprentice', 141, F - 1, 'duel', { face: -1 });   /* AN APPRENTICE DUEL behind the rails */
  coins([133, 39], [143, 39]);
  rail(146, 27, F - 1);                                                             /* RAIL TWO */
  well(150, 156, 'THE ORCHESTRA PIT'); coins([153, 34]);                            /* jump, then blink across */
  ground(157, 179, F); rail(162, 27, F - 1);                                        /* RAIL THREE, past the pit */
  fill(164, 169, 41, 42, T.AIR); coins([165, 42], [166, 42], [168, 42]);            /* THE PREP CELLAR under the floor ... */
  rune(163, F - 1, [[166, 40], [167, 40]]);                                         /* ... its trapdoor lifts for the rune */
  foe('armour', 168, F - 1, 'hallArmour', { face: -1 }); foe('bat', 158, 30, 'hallBat', { perch: true });
  ent('check', 172, F - 1);                                                         /* SHRINE ONE */
  coins([176, 39]);
  ride(126, 166, 39, 39);                                                           /* BLINK through the rails and over the pit */

  // ================= 3. THE CONJURATION YARD (180-249): TWIST - CONJURE STEP =================
  room('yard', 'conjure', 180, 249);
  ground(180, 189, F); lectern(184, F - 1, 'conjure', 'yard'); sign(181, F - 1, AC_SAY.yard);
  well(190, 235, 'THE SUMMONING WELL'); fill(190, 235, F, H - 1, T.AIR);
  fill(200, 202, 37, 37, T.SOLID); hull.push([200, 202, 37, 37]); coins([201, 36]);                  /* FLOATING STONES: a breath between chains */
  ent('mover', 213, 36, { len: 3, range: 3, vert: true, speed: 24 });                               /* a summoned stone, bobbing */
  fill(226, 228, 36, 36, T.SOLID); hull.push([226, 228, 36, 36]); coins([227, 35]);
  foe('imp', 207, 30, 'wellImp'); foe('acflock', 220, 28, 'wellFlock');
  ground(236, 249, F);
  foe('apprentice', 240, F - 1, 'yardPupil', { face: -1 }); foe('broom', 247, F - 1, 'yardBroom', { face: -1 });
  fill(241, 246, 41, 42, T.AIR); ent('silver', 245, 42); coins([242, 42]);        /* SECRET TWO: the summoners' cellar ... */
  rune(239, F - 1, [[242, 40], [243, 40]]);                                        /* ... under a trapdoor */
  ride(186, 238, 33, 39);                                                           /* CONJURE STEP over the well */

  // ================= 4. THE EXAM HALL (250-299): EXAM - EVERY LESSON, FAST =================
  room('exam', null, 250, 299);                                                      /* the lecterns here swap the spell as you go */
  fill(250, 299, 0, 21, T.SOLID);
  ground(250, 259, F); lectern(252, F - 1, 'levitate', 'exam'); sign(250, F - 1, AC_SAY.exam);
  foe('apprentice', 256, F - 1, 'examPupil', { face: -1 });
  fill(260, 261, 28, F - 1, T.SOLID);                                               /* QUESTION ONE: a wall to float over */
  ground(262, 279, F); lectern(264, F - 1, 'blink', 'exam');
  foe('armour', 268, F - 1, 'examArmour', { face: -1 });
  rail(272, 22, F - 1);                                                             /* QUESTION TWO: a rail to blink */
  lectern(276, F - 1, 'conjure', 'exam'); coins([274, 39]);
  well(280, 289, 'THE EXAM GAP'); foe('acflock', 285, 30, 'examFlock');              /* QUESTION THREE: a gap to build over */
  ground(290, 299, F); sign(292, F - 1, AC_SAY.gate); ent('check', 296, F - 1);     /* SHRINE TWO */
  ride(253, 263, 26, 39); ride(266, 278, 39, 39); ride(277, 291, 34, 39);

  // ================= 5. THE EXAMINATION (300-339): THE HEADMISTRESS =================
  const A = AC.arena;
  fill(300, 339, 0, 22, T.SOLID); ground(300, 338, F); fill(339, 339, 0, H - 1, T.SOLID);
  fill(302, 307, A.gallery, A.gallery, T.ONEWAY); fill(332, 337, A.gallery, A.gallery, T.ONEWAY); hull.push([302, 307, A.gallery, A.gallery], [332, 337, A.gallery, A.gallery]);   /* THE HIGH GALLERIES */
  const aLec = [lectern(304, F - 1, 'levitate', 'arena', { arena: true }), lectern(319, F - 1, 'blink', 'arena', { arena: true }), lectern(334, F - 1, 'conjure', 'arena', { arena: true })];
  ent('headmistress', 319, 29, { face: -1 });
  ride(301, 338, 28, 39);
  const arena = { x0: A.x0 * TS, x1: (A.x1 + 1) * TS, floor: F * TS, y0: 23 * TS, trigger: A.trigger * TS, wallL: A.wallL, wallR: A.wallR, boss: 'headmistress', music: 'boss3', tint: '#c8b0ff', tintA: 0.05,
    /* THE FIGHT'S GEOMETRY (src/headmistress.js geom): the rafters she lectures from, the lecterns, the floor that dissolves and the ledges that stay */
    rafterY: (A.gallery - 1) * TS, galleries: [[302, 307], [332, 337]].map(([a, b]) => [a * TS, (b + 1) * TS]), lecterns: aLec.map(l => l.id),
    pit: A.pit.map(([a, b]) => [a, b]), ledges: A.ledges.map(([a, b]) => [a, b]), deskY: 35 * TS, ceil: 23 * TS };

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 2, y: F - 1 }, pools: [], falls: [],
    arena, academy: true,
    ac: { rooms, lecterns, rails, wells, runes, catchY: AC.catchY, sections: SECTIONS },
    calm: [[0, W - 1, 0, H - 1]], noCoin: [[A.x0, W - 1, 0, H - 1]],
    checkRun: 200,
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: A.x0, hi: W - 1, spots: 0, why: 'THE EXAMINATION: the boss arena - no squad stands in it' }],
    unlocks: [
      { kind: 'aclectern', opens: 'the room\'s cantrip (levitation / blink / conjure step) for as long as you stay in it', hud: AC_RULE },
      { kind: 'acrail', opens: 'nothing for feet: a blink passes it', hud: AC_SAY.lecture },
      { kind: 'acwell', opens: 'a pit with no floor: it files you back (14)', hud: AC_SAY.filed },
      { kind: 'acrune', opens: 'a shutter into a cellar or an alcove that pays (a secret)', hud: AC_SAY.lifted },
    ],
    rigBands,
    duskStart: -1, duskLen: 1, music: 'cave', night: true, nightA: 0.12, edgeLit: true,
    palette: { sky: 'mage', far: 'mage', mid: 'mage', near: 'none', dress: 'none', haze: 'rgba(150,120,210,0.10)',
      grass: '#5a5470', grassL: '#7c7494', grassD: '#3a3450', dirt: '#4a4652', dirtL: '#645e6c', dirtD: '#2e2a36' },
    ambient: [{ x0: 0, x1: 18 * TS, kind: 'wind' }, { x0: 18 * TS, x1: 180 * TS, kind: 'hall' }, { x0: 180 * TS, x1: 250 * TS, kind: 'wind' }, { x0: 250 * TS, x1: 99999, kind: 'hall' }],
    /* THE FLOATING STONES AND THE GALLERIES ARE HELD BY THE SPELLS (tools/solid-islands.mjs): the yard's stones are summoned, the galleries hang from the rafters (art lane) */
    hullZones: hull,
    reachExact: false,
    acRule: AC_RULE,
  };
}
