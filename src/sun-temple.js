// src/sun-temple.js - THE SUN TEMPLE, the desert's optional spur off THE GLASS SEA (claude/suntemple, 11-06, the OPUS GREYBOX: geometry, the moving sun,
// the halls, the dusk siege, the arena and its light; ART + music are the sonnet lanes'). Plan: scratch/plan-desert-1105.md section 5 (Daniel APPROVED 11-05 14:07),
// brief scratch/brief-suntemple.md (+ the 10-14 "THE BOSS IS THE HERO" line). Boss: THE FALLEN SUN PRIEST (src/fallen-sun.js, his hands src/fallen-sun-hands.js).
// The level's hands: src/sun-temple-hands.js. The sun/light pieces are the desert kit's (src/sun-puzzle.js L.sunRooms, drawn by src/sunroom-hands.js with
// src/beam-path.js, on src/light.js): NOTHING here is a new light system.
//
// THE RULE: THE SUN MOVES. Each hall is a room under a row of high windows; over the hall's day the sun comes through one window after another (light.js
// templeSun). A SUN-DOOR opens when the sun's light reaches its eye - and only a MIRROR under the window the sun is in can turn the light along to it: turn the
// right mirror (any blow turns it) and wait for the sun, or come back. The sun's place is always DRAWN (the dial on the HUD band: five windows, the lit one gold,
// and how long until the sun reaches the mirror that matters - src/sun-temple-hands.js), never a hidden timer. Standing in the sun's light MENDS you and BURNS
// THE DEAD. At DUSK (THE DUSK HALL) the windows go out one by one and the dead come: sweep the last light across them with the mirrors.
// Rule kept (Daniel 09-21, plan 3j): SUN-DOORS answer to the SUN only. ONE optional PRIEST CACHE (plan Q5): a sun-seal only THE DESERT PRIEST's beam opens (silver).
//
// SECTIONS (columns; H 40; the floors step up and down - no long level stretch):
//   0-47     THE STAIR OF DAWN     TEACH   outside: white steps up to the porch; THE GATE OF DAWN: one shaft on one mirror turned wrong - strike it, the door opens.
//                                           The porch roof (a climb off the route): a silver.
//   48-99    THE HALL OF WINDOWS   TEACH 2 the moving sun: one mirror under window 4 of 5. Turn it and WAIT FOR THE SUN (the dial counts it down); the shafts
//                                           burn the dead while you wait. The gallery climb (off the route): a silver.
//   100-139  THE SUNDIAL COURT     TEST    the platforming section: an open court climbed ledge to ledge over a spiked floor; a TWO-MIRROR CHAIN (a low mirror
//                                           throws the light across to a high one that sends it up to the eye) at one hour. THE PRIEST CACHE in the west wall.
//   140-199  THE CLOISTER OF NOON  REMIX   a HOLD door: it stands open only while the sun is on its eye, and shuts (told) when the sun moves on - the fallen
//                                           guard in the sunken garden between you and it. CHECKPOINT ONE.
//   200-250  THE DUSK HALL         EXAM    THE DUSK SIEGE (an ambush room): the dead rise as the windows go out one by one; two mirrors sweep the light.
//   251-279  THE HIGH ALTAR        rest    the approach. CHECKPOINT TWO (the shrine before him).
//   280-323  THE SANCTUM           BOSS    THE FALLEN SUN PRIEST (src/fallen-sun.js): three windows with shutters, two mirrors - put him in SHADE.
//
// THE FLAG: TEMPLE_SHIPS false. Off, the level is in LEVELS (appended, so no save index moves) but HIDDEN: no map node, no spur, nothing on the live road. On
// (?temple=1, globalThis.BRACKEN_TEMPLE, or BRACKEN_TEMPLE=1 in a Node tool's env) it is the spur off THE GLASS SEA (needs + spurOf 'glasssea'): the spur is
// drawn once the Glass Sea is cleared (the find on its road is the Colossus 4 lane's GLYPH COURT, L.templeSpur).
export const TEMPLE_SHIPS = false;
export function templeOn() {
  if (TEMPLE_SHIPS) return true;
  try { if (globalThis.BRACKEN_TEMPLE === true || globalThis.BRACKEN_TEMPLE === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]temple=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_TEMPLE === '1') return true; } catch { /* no node */ }
  return false;
}
export const TEMPLE_RULE = 'THE SUN MOVES: A MIRROR TURNS ONLY THE LIGHT THAT FALLS ON IT. STAND IN THE SUN TO MEND; IT BURNS THE DEAD.';
export const ST = { W: 328, H: 40, start: [3, 33] };
export const SECTIONS = [['THE STAIR OF DAWN', 0], ['THE HALL OF WINDOWS', 48], ['THE SUNDIAL COURT', 100], ['THE CLOISTER OF NOON', 140], ['THE DUSK HALL', 200], ['THE HIGH ALTAR', 251], ['THE SANCTUM', 280]];
/* THE SANCTUM (the arena), local columns from its west wall + 1; R = its floor row. Windows in the roof (each with a SHUTTER on a cord), two MIRRORS on posts under
   the outer two at chest height (R - 2): as built they throw the outer shafts INWARD along the floor, so the whole floor is lit - the light is his */
export const SANCTUM = { sx: 280, W: 44, R: 20, roof: 6, windows: [8, 22, 36], mirrors: [{ c: 8, state: '\\' }, { c: 36, state: '/' }], cords: [4, 25, 40], ledges: [[12, 16], [28, 32]], ledgeRow: 17, him: 22 };
/* THE DUSK HALL's siege: the windows go out in this order (seconds after the room shuts) - the west one is the last light and never goes */
export const DUSK = { out: [{ id: 'duskE', t: 14 }, { id: 'duskC', t: 28 }], say: 'DUSK: THE SUN GOES DOWN AND THE DEAD RISE' };

export function buildSunTemple({ painter, T, TS }) {
  const { W, H } = ST;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const boards = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ face: -1, squad }, o || {}));
  /* THE CAST (0 new foes - plan s5 "Acolytes = ranged reskin"; proven machines, the temple's skins owed to the art lane):
     SUN ACOLYTE (gobmage under the bandit mystic's skin: the told sand bolt - ART: a sun-acolyte skin), THE TEMPLE DEAD (mummy, and the tomb skeleton - the
     sun burns both), BONE ARCHER (ranged dead), FALLEN PRIEST (deadpriest: raises and mends the dead - the kill-first), FALLEN TEMPLE GUARD (deadpaladin: the
     heavy, the cloister's elite), TEMPLE JACKAL (the war hound: the runner) */
  const acolyte = (x, y, squad) => foe('gobmage', x, y, squad, { cnSkin: 'banditmystic', temple: 'acolyte' });
  const mummy = (x, y, squad, o) => foe('mummy', x, y, squad, o);
  const skel = (x, y, squad) => foe('mummy', x, y, squad, { cnSkin: 'tombskel' });
  const jackal = (x, y, squad) => foe('hound', x, y, squad, { cnSkin: 'jackal' });
  const decor = [], structures = [], plats = [];
  const ledge = (kind, x0, x1, y) => { boards(x0, x1, y); plats.push({ kind, x0, x1, y }); };

  /* THE TEMPLE IS ONE MASS of white limestone: solid to the edges; the sky, the halls and the court carved out of it */
  block(0, W - 1, 0, H - 1);
  air(48, W - 1, 0, 7);                                                   /* the sky over the temple's roof */

  // ================= 0. THE STAIR OF DAWN (0-47) =================
  const STEPS = [[0, 9, 34], [10, 13, 32], [14, 17, 30], [18, 21, 28], [22, 25, 26], [26, 47, 24]];
  for (const [x0, x1, top] of STEPS) air(x0, x1, 0, top - 1);
  block(39, 47, 17, 17); set(42, 17, T.AIR);                              /* THE PORCH ROOF and its one opening: the shaft of dawn */
  decor.push({ kind: 'porch', x0: 39, x1: 47, y: 17 }, { kind: 'sunglyph', x: 47, y: 22 });
  sign(2, 33, 'THE SUN TEMPLE. THE SUN MOVES.');
  sign(37, 23, 'STRIKE THE MIRROR: IT TURNS. THE SUN OPENS THE DOOR.');
  jackal(12, 31, 'dawnJackal');
  acolyte(20, 27, 'dawnStep'); acolyte(31, 23, 'dawnLanding');
  /* off the route: up the broken lintels to the porch roof - a silver */
  ledge('lintel', 30, 33, 21); ledge('lintel', 34, 37, 18);
  ent('silver', 45, 16);

  // ================= 1. THE HALL OF WINDOWS (48-99): floor 30, roof 14 =================
  air(49, 50, 15, 23); air(51, 52, 15, 25); air(53, 54, 15, 27); air(55, 99, 15, 29);   /* the threshold, and the steps down into the hall */
  const HALL_WIN = [60, 68, 76, 84, 92];
  for (const x of HALL_WIN) air(x, x, 8, 14);                             /* the window wells up through the roof to the sky */
  sign(50, 23, 'THE HALL OF WINDOWS. WATCH THE DIAL: THE SUN COMES TO EACH WINDOW IN TURN.');
  sign(79, 29, 'A MIRROR TURNS ONLY THE LIGHT THAT FALLS ON IT. TURN IT, AND WAIT FOR THE SUN.');
  /* the gallery climb (off the route): boards up the north wall to a silver over the fourth window */
  ledge('gallery', 58, 63, 27); ledge('gallery', 65, 70, 24); ledge('gallery', 72, 76, 21); ledge('gallery', 78, 82, 18);
  ent('silver', 81, 17);
  mummy(64, 29, 'hallDead1'); acolyte(69, 23, 'hallGallery');
  mummy(88, 29, 'hallDead2'); skel(91, 29, 'hallDead2'); foe('deadpriest', 96, 29, 'hallDead2');

  // ================= 2. THE SUNDIAL COURT (100-139): an open court, floor 30, a lattice roof at row 5 =================
  air(101, 138, 0, 29); block(101, 138, 5, 5);
  const COURT_WIN = [106, 113, 120, 127, 134];
  for (const x of COURT_WIN) set(x, 5, T.AIR);
  for (let x = 117; x <= 124; x++) set(x, 29, T.SPIKE);                  /* the court floor under the long jumps: the sun's spikes (a fall costs) */
  ledge('court', 105, 108, 27); ledge('court', 110, 116, 24); ledge('court', 120, 123, 24); ledge('court', 127, 132, 24);
  ledge('court', 134, 137, 21); ledge('court', 129, 132, 18); ledge('court', 133, 135, 15);
  block(136, 138, 13, 13);                                                /* the lip under the high door */
  block(139, 139, 0, 9);                                                  /* the court's east wall stands to the sky over its door (no way over into the cloister) */
  /* THE PRIEST CACHE: a sealed alcove in the west wall - a silver behind a sun-seal (104, 22-23) only THE DESERT PRIEST's beam opens (UP from the low ledge) */
  block(101, 104, 24, 24); block(101, 104, 21, 21); block(104, 104, 22, 23); ent('silver', 102, 23, { cache: 'priestCache' });
  decor.push({ kind: 'sunseal', x: 107, y: 21 }, { kind: 'gnomon', x: 120, y0: 6, y1: 23 });
  sign(102, 29, 'THE SUNDIAL COURT. TWO MIRRORS, ONE HOUR: THE LOW ONE THROWS THE LIGHT ACROSS, THE HIGH ONE SENDS IT UP.');
  /* (no foe inside the climb: THE SUNDIAL COURT is the level's PLATFORMING SECTION - its exam is the chain, timed to the sun, over the spikes) */

  // ================= 3. THE CLOISTER OF NOON (140-199): floor 13 / 12, a sunken garden, the roof at row 4 =================
  air(140, 199, 0, 12); block(140, 199, 4, 4); block(200, 200, 0, 8);   /* (the noon door's wall stands to the sky too) */
  const CLOISTER_WIN = [150, 160, 170, 180, 190];
  for (const x of CLOISTER_WIN) set(x, 4, T.AIR);
  for (let x = 150; x <= 199; x++) set(x, 12, T.SOLID);                  /* a step up onto the cloister walk (row 12) past the court's door */
  air(161, 171, 12, 16);                                                  /* THE SUNKEN GARDEN (its floor row 17) */
  ledge('garden', 168, 171, 14);                                          /* the garden stair up the east side */
  block(140, 141, 5, 10);                                                 /* the pier at the cloister's west end: the light stops on it */
  for (let x = 186; x <= 188; x++) set(x, 11, T.SPIKE);                  /* the sun-spikes in the walk before the noon door: jump them */
  ent('check', 143, 12);                                                  /* CHECKPOINT ONE: the court climbed */
  sign(145, 12, 'THE CLOISTER OF NOON. THE NOON DOOR STANDS OPEN ONLY WHILE THE SUN IS ON IT.');
  foe('bonearcher', 147, 12, 'clWest'); acolyte(155, 11, 'clWest'); foe('deadpaladin', 166, 16, 'clGuard', { elite: true }); acolyte(190, 11, 'clEast'); mummy(195, 11, 'clEast');

  // ================= 4. THE DUSK HALL (200-250): floor 20, roof 8 =================
  air(201, 202, 9, 11); air(203, 204, 9, 13); air(205, 206, 9, 15); air(207, 208, 9, 17); air(209, 250, 9, 19);
  const DUSK_WIN = [212, 225, 238];
  for (const x of DUSK_WIN) set(x, 8, T.AIR);
  air(251, 251, 18, 19);                                                  /* the low way on to the altar */
  sign(210, 19, 'THE DUSK HALL. WHEN THE SUN GOES, TURN THE LAST LIGHT ON THE DEAD.');

  // ================= 5. THE HIGH ALTAR (251-279): the approach, floor 20 =================
  air(252, 278, 12, 19); block(258, 263, 17, 19);                         /* the altar dais: up and over */
  jackal(266, 19, 'altarJackals'); jackal(269, 19, 'altarJackals');
  ent('check', 274, 19);                                                  /* CHECKPOINT TWO: the shrine before him */
  sign(276, 19, 'THE SANCTUM. HE FEEDS ON THE LIGHT: PUT HIM IN SHADE.');

  // ================= 6. THE SANCTUM (280-323): THE FALLEN SUN PRIEST =================
  const st = stageFallenSun({ set, block, ent, air, boards }, T, TS);
  st.carve();
  ent('gate', SANCTUM.sx + SANCTUM.W - 2, SANCTUM.R - 1);

  /* THE SUN ROOMS (src/sun-puzzle.js; drawn + struck by src/sunroom-hands.js). Tiles. Moving sun = { windows, day } */
  const wins = (xs, y) => xs.map(x => ({ x, y, dir: 'S' }));
  const sunRooms = [
    { id: 'gateOfDawn', box: [36, 17, 47, 23], sources: [{ x: 42, y: 17, dir: 'S' }], mirrors: [{ x: 42, y: 22, state: '/' }],
      doors: [{ id: 'dawnDoor', kind: 'sun', eye: [47, 22], opens: [48, 21, 48, 23] }] },
    { id: 'hallOfWindows', box: [49, 14, 99, 29], sources: [{ windows: wins(HALL_WIN, 14), day: 30 }], mirrors: [{ x: 84, y: 28, state: '/' }],
      doors: [{ id: 'hallDoor', kind: 'sun', eye: [99, 28], opens: [100, 27, 100, 29] }] },
    { id: 'sundialCourt', box: [101, 5, 138, 29], sources: [{ windows: wins(COURT_WIN, 5), day: 30 }], mirrors: [{ x: 113, y: 22, state: '/' }, { x: 130, y: 22, state: '\\' }],
      doors: [{ id: 'courtDoor', kind: 'sun', eye: [130, 11], opens: [139, 10, 139, 12] },
        { id: 'priestCache', kind: 'cache', eye: [107, 21], opens: [104, 22, 104, 23], optional: true }] },
    { id: 'cloister', box: [140, 4, 199, 17], sources: [{ windows: wins(CLOISTER_WIN, 4), day: 20 }], mirrors: [{ x: 180, y: 10, state: '/' }],
      doors: [{ id: 'noonDoor', kind: 'sun', eye: [199, 10], opens: [200, 9, 200, 11], mode: 'hold' }] },
    { id: 'duskHall', box: [201, 8, 250, 19], sources: [{ id: 'duskW', x: 212, y: 8, dir: 'S' }, { id: 'duskC', x: 225, y: 8, dir: 'S' }, { id: 'duskE', x: 238, y: 8, dir: 'S' }],
      mirrors: [{ x: 212, y: 18, state: '/' }, { x: 238, y: 18, state: '\\' }], doors: [{ id: 'duskLamp', kind: 'lamp', eye: [225, 19] }] },
    st.room,
  ];
  /* the cloister's noon door and the court's high door are the doors you cannot walk round: the hold door is told before it shuts (src/sun-puzzle.js DOOR.tell) */
  const ambushes = [{ name: 'THE DUSK SIEGE', row: 19, wallL: 209, wallR: 250, check: false, gold: 15, dusk: true,
    waves: [[['mummy', 216], ['mummy', 234], ['bonearcher', 244], ['deadpriest', 228]], [['mummy', 214, 19, { cnSkin: 'tombskel' }], ['mummy', 236, 19, { cnSkin: 'tombskel' }], ['mummy', 225], ['hound', 246, 19, { cnSkin: 'jackal' }]]] }];

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: ST.start[0], y: ST.start[1] }, pools: [], falls: [], moversExtra: [], interiors: [],
    arena: st.arena, gateAfterBoss: true,
    suntemple: true, caravan: true,   /* caravan: the desert's hands in main.js (the sun, the creatures' machines, the sand skins) */
    sunRooms, ambushes, dusk: DUSK, decor, structures, plats,
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,
    unlocks: [
      { kind: 'sunRooms', opens: "every hall's sun-door (a mirror under the window the sun stands in turns its light to the door's eye: any blow turns it), and THE PRIEST CACHE in the Sundial Court (a sun-seal only THE DESERT PRIEST's beam breaks: a silver)", hud: "THE SUN OPENS THE DOOR (the dial: where the sun is, and when it comes to your mirror) / THE PRIEST'S LIGHT BREAKS THE SUN-SEAL" },
    ],
    music: 'glasssea',   /* TODO (art/music lane): THE SUN TEMPLE's own track and his. Borrowed from the Glass Sea until then (level-quality's music row: WARN) */
    ambient: [{ x0: 0, x1: 99999, kind: 'glassday' }],
    rockZones: [], masonry: [],
    palette: { set: 'suntemple', near: 'none', dress: 'none', noFg: true, noNear: true, haze: 'rgba(255,236,170,0.06)' },   /* (src/redraw/desert_sets.js SETS.suntemple: the backdrop exists) */
    templeOn: templeOn(),
    duskStart: -1, duskLen: 1,
  };
}

/* THE SANCTUM: carve it, and say where everything is. Its light is an L.sunRooms room ('sanctum'): the three windows are fixed sources (a shut SHUTTER sets the
   source `off`), the two mirrors turn on any blow (src/sunroom-hands.js) and he turns them back from his second phase (src/fallen-sun.js) */
export function stageFallenSun(W, T, TS) {
  const { set, block, ent, air, boards } = W, S = SANCTUM, sx = S.sx, R = S.R, ex = sx + S.W, X = c => sx + c;
  const carve = () => {
    air(sx, ex - 1, S.roof + 1, R - 1);
    block(sx - 1, sx - 1, S.roof, R - 4); air(sx - 1, sx - 1, R - 3, R - 1);  /* the west wall over the way in (it shuts behind you), and the way in */
    block(ex, ex, S.roof, R - 1);
    block(sx - 1, ex, S.roof, S.roof);                                        /* the roof... */
    for (const c of S.windows) set(X(c), S.roof, T.AIR);                    /* ...and its three windows */
    for (const [a, b] of S.ledges) boards(X(a), X(b), S.ledgeRow);           /* two low galleries: over his beam */
    ent('fallensun', X(S.him), R - 1, { face: -1 });
  };
  const room = { id: 'sanctum', box: [sx, S.roof, ex - 1, R - 1],
    sources: S.windows.map((c, i) => ({ id: 'sanctum' + i, x: X(c), y: S.roof, dir: 'S' })),
    mirrors: S.mirrors.map(m => ({ x: X(m.c), y: R - 2, state: m.state })),
    doors: [{ id: 'altarLamp', kind: 'lamp', eye: [X(S.windows[1]), R - 1] }] };
  const arena = { x0: sx * TS, x1: ex * TS, floor: R * TS, trigger: (sx + 3) * TS, wallL: sx - 1, wallR: ex, boss: 'fallensun',
    tint: '#ffe8b0', tintA: 0.06, start: [sx + 2, R - 1], y0: (S.roof + 1) * TS, y1: (R + 1) * TS, fs: { sx, R } };
  return { arena, carve, room };
}
