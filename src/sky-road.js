// src/sky-road.js - THE SKY ROAD (claude/skyroad, the GREYBOX, 2026-10-05). Brief: docs/concepts/sky-road.md (Daniel's concept answers of 10-03:
// main road Gale Moor > THE SKY ROAD > the Ore Road > Stormhold; the moor keeps SIDEWAYS gusts on the ground, the Sky Road owns VERTICAL air).
// This file is the level the game runs, laid by hand (nothing sprinkled); src/sky-road-hands.js is its rule and machines, src/roc-eyrie.js its boss.
//
// THE RULE (L.rule; the FIX PASS named the stone strike in it): THE SUN WARMS THE ROCK AND THE AIR RISES. STRIKE A SUN-STONE TO WAKE ITS AIR; RIDE IT, GLIDE INTO IT. A CLOUD ON IT KILLS IT.
//   A THERMAL is a 'vent' ent with thermal: true (so src/reachcore.js rides it like any vent): a column of rising air over sun-hot rock, from its
//   foot (y) up `h` px. A CLOUD's shadow (L.clouds, drawn creeping over the rock) on its foot kills it while it is there.
//   THE RIDER'S CLOAK (ent 'cloak', taken at the station): hold jump as you fall and you GLIDE; glide into a thermal and it lifts you hard.
//   A SUN-STONE (ent 'sunstone'): a thermal with src 'stone:<id>' is dead until you STRIKE its stone round to the sun. THE SUN-DISC (ent 'sundisc')
//   does the same for a whole ROAD of thermals at once, for DISC.live seconds. THE GREAT KITE REEL: the station's war-kite climbs the reel
//   chimney's hot air (its own stone) and hauls the cage up the cliff - only while the sun is on the chimney.
//   THE CLOUD SEA (L.cloudSea): under every chasm. A fall into it costs health and the updraft under it throws you back to your last footing.
//
// FIVE SECTIONS (columns; rows: smaller is higher; the cloud sea's top is row 55):
//    0-104  THE MESA STEPS        TEACH the rise + the cloud   two thermals up two mesa faces no jump climbs, the second under a cloud bank
//  104-190  THE RIDERS' STATION   TEACH the cloak + the stone  the cloak; a glide over sand (cheap); the first sun-stone; glide INTO a thermal
//                                 SET PIECE A                  THE GREAT KITE REEL: the chimney's stone, the kite, the cage up the cliff
//  190-298  THE HARPY ROOSTS      TEST + REMIX                 a chain of roost pillars and thermals under a rolling cloud bank; a stone on a
//                                                              pillar; harpies that snatch, kite-riders, a hornblower, slingers, a hawk
//  298-388  THE BROKEN SKY BRIDGE SET PIECE B + THE EXAM       THE SUN-DISC wakes a road of thermals over the chasm; then the broken spans
//                                                              (cracked stone) between stones you turn, clouds, snatches, riders - all of it
//  388-442  THE EYRIE             THE ROC (src/roc-eyrie.js)   her nest of masts, bones and kite cloth; rim thermals; iron kite-masts
//  442-459  the road down         the cloak is hung back on a mast; the road goes down toward the Ore Road
export const SKYROAD = { W: 460, H: 60, sea: 55, arena: [390, 440], floor: 18 };
export const SECTIONS = [['THE MESA STEPS', 0, 104], ["THE RIDERS' STATION", 104, 190], ['THE HARPY ROOSTS', 190, 298], ['THE BROKEN SKY BRIDGE', 298, 388], ['THE EYRIE', 388, 460]];
/* each mechanic's arc in COLUMNS - TAUGHT, DEVELOPED (tested), TWISTED (remixed), EXAMINED - read by tools/skyroad.mjs and the brief */
export const ARCS = {
  thermal: { teach: [27, 52], develop: [53, 104], twist: [190, 298], exam: [338, 388] },     /* the first rise; under a cloud; the roost chain; the spans */
  cloak: { teach: [96, 124], develop: [124, 134], twist: [190, 298], exam: [298, 333] },       /* over sand; into a thermal; the chain; the disc road */
  stone: { teach: [116, 134], develop: [134, 151], twist: [298, 333], exam: [346, 388] },      /* the first stone; the reel's chimney; the disc; a stone on a crumbling span */
  cloud: { teach: [58, 80], develop: [135, 160], twist: [205, 262], exam: [300, 380] },
};
export const DISC = { live: 16, stagger: 0.45 };   /* s the disc's road stays lit; s between one thermal of the road waking and the next */

export function buildSkyRoad({ painter, T, TS }) {
  const { W, H } = SKYROAD, SEA = SKYROAD.sea, FL = SKYROAD.floor;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const plank = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const rock = (x0, x1, top) => block(x0, x1, top, H - 1);                     /* a mesa / pillar: rock from its top down into the cloud sea */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ squad }, o || {}));
  const cloth = (x, y) => ent('stray', x, y, { kind: 'kite' });               /* A KITE CLOTH: the quest (L.quest), drawn as the moor's lost-kite icon */
  const crumbles = [], clouds = [], vaultDoors = [], decor = [];
  /* A THERMAL: rising air from the foot row `foot` (the air row over its rock) up to row `top` (the model reaches ledges standing on row `top`
     within three columns; in the game the column runs SKY's overshoot higher, so you crest and drift onto them). src: null (natural), 'stone:id', 'disc:id' */
  const thermal = (x, foot, top, src, o) => ent('vent', x, foot, Object.assign({ thermal: true, h: (foot + 1 - top) * TS, w: 20, lift: 150, src: src || null }, o || {}));
  /* a sun-warmed PINNACLE in a chasm, just over the cloud sea, with a thermal off it */
  /* (claude/skyroad2, Daniel 10-08 "I got stuck here in the Sky Road": a disc-road pinnacle after the disc's sun had moved off it) A FOOTING WHOSE ONLY WAY OUT IS ONE
     THERMAL's AIR (L.airOnly: its tiles, the row a hero stands on, the thermal's column) is never the cloud sea's "last solid footing" while that air is dead -
     the updraft threw you back onto the dead pinnacle you had just dropped off, for ever. tools/skyroad-stuck.mjs finds every such footing and holds this list to it */
  const airOnly = [], pinnacle = (x, top, src, o) => { rock(x - 1, x + 1, SEA - 2); thermal(x, SEA - 3, top, src, o); if (src) airOnly.push({ x0: x - 1, x1: x + 1, row: SEA - 3, vent: x }); };
  const stone = (x, y, id) => ent('sunstone', x, y, { id });
  /* A CLOUD BANK over columns c0..c1: clouds `w` columns wide, `gap` columns apart, drifting `speed` px/s (east +) - its shadow on a thermal's foot kills it */
  const cloudBank = (c0, c1, w, gap, speed, phase) => clouds.push({ x0: c0 * TS, x1: (c1 + 1) * TS, w: w * TS, gap: gap * TS, speed, phase: (phase || 0) * TS });
  const crumble = (x0, x1, row) => { for (let x = x0; x <= x1; x++) set(x, row, T.SOLID); crumbles.push({ x0, x1, row, rows: 1, count: 3, sky: true }); };

  // ================= 1. THE MESA STEPS (0-104): TEACH the rise and the cloud =================
  rock(0, 22, 46); set(0, 45, T.SOLID); for (let y = 0; y < 46; y++) set(0, y, T.SOLID);    /* the start mesa (and the world's west edge) */
  sign(7, 45, 'THE SKY ROAD. THE ROCK IS HOT: THE AIR OVER IT RISES.');
  rock(15, 17, 44); plank(6, 12, 43);                                                             /* a kite-rider's old perch over the start (a second height) */
  rock(23, 26, 49); rock(27, 46, 52);                                           /* a step down, and the sand under the first face (a miss costs a walk) */
  plank(28, 32, 48); plank(39, 44, 47);                                        /* broken scaffold over the sand: a step up out of it */
  thermal(34, 51, 40); plank(35, 36, 40);                                       /* THERMAL ONE: up the face of mesa A (twelve rows: no jump), a lip to step onto */
  sign(31, 51, 'STAND IN THE RISING AIR.');
  rock(37, 52, 40); plank(43, 49, 37); air(37, 51, 44, 47); ent('coin', 42, 47); ent('coin', 47, 47);   /* (and a hollow under it, in off thermal one's column) */                                         /* MESA A, and the bowman's stand over it */
  foe('shield', 41, 39, 'mesaTop', { face: -1 }); foe('archer', 50, 39, 'mesaTop', { face: -1 });   /* the shield covers the bow: you come up the face into them */
  cloth(51, 39);                                                                /* KITE CLOTH ONE: behind the bow */
  rock(53, 72, 50);                                                             /* the sand under mesa B */
  thermal(67, 49, 34);                                                          /* THERMAL TWO: up mesa B's face (sixteen rows) - under a cloud bank */
  cloudBank(58, 80, 6, 10, 16, 0);                                              /* ...that comes over it six seconds in sixteen: wait for the sun */
  sign(62, 49, 'A CLOUD ON THE ROCK KILLS THE AIR. WAIT FOR THE SUN.');
  foe('kite', 64, 40, 'mesaKite');                                              /* a goblin kite hangs in thermal two: high in the sun, sunk into reach when the cloud kills it */
  plank(55, 61, 46);                                                            /* a ledge over the sand under mesa B */
  rock(70, 104, 34); air(70, 99, 39, 42);                                       /* MESA B, and THE WIND CAVE under its top: in off thermal two's column at its west face (a pocket, coins) */
  ent('coin', 80, 42); ent('coin', 86, 42); ent('coin', 92, 42); ent('deco', 96, 42, { kind: 'bones' });
  plank(76, 84, 31); rock(88, 91, 32); air(88, 91, 39, 42);                                       /* the station's lookout boards over the mesa top (claude/skyroad2: the winch block no longer seals the wind cave's east half - its two coins and the bones sat in a pocket nobody could reach) */

  // ================= 2. THE RIDERS' STATION (104-190): the cloak, the stone, THE GREAT KITE REEL =================
  ent('check', 72, 33);                                                         /* CHECKPOINT ONE: the station's west gate */
  ent('cloak', 97, 33); decor.push({ kind: 'mast', x: 97, y: 33 });             /* THE RIDER'S CLOAK on its mast */
  sign(100, 33, "THE RIDER'S CLOAK: HOLD JUMP AS YOU FALL, AND GLIDE.");
  rock(105, 115, 46); plank(106, 111, 42);                                                           /* the sand shelf under the first glide: a miss lands here */
  thermal(113, 45, 38);                                                         /* ...and a thermal off it back up to the ledge */
  foe('harpy', 110, 30, 'firstHarpy');                                         /* the first harpy, over the shelf: a snatch drops you on sand */
  rock(116, 122, 38); plank(117, 122, 34);                                                           /* LEDGE ONE: twelve columns from mesa B (the glide) */
  stone(120, 37, 's1'); sign(118, 37, 'A SUN-STONE. STRIKE IT ROUND TO THE SUN.');
  pinnacle(131, 26, 'stone:s1');                                                /* THERMAL FOUR over the chasm: dead until the stone is turned; glide INTO it */
  ent('silver', 131, 52);                                                       /* SILVER ONE: on its pinnacle, over the cloud sea (the thermal takes you back up) */
  rock(134, 150, 26); plank(132, 133, 26); plank(134, 138, 23); air(134, 147, 30, 33); ent('coin', 140, 33); ent('coin', 145, 33);   /* (a riders' store under the deck, in off thermal four's column) */                 /* LEDGE TWO: the station's lower deck, and a rigger's step */
  /* THE GREAT KITE REEL: the chimney's stone heats the chimney, its hot air carries the war-kite up, the kite hauls the cage up the cliff. A cloud on the
     chimney and the kite sinks, and the cage with it. The chimney is a flue standing at the deck's back (scenery: its hot air leaves its mouth high over you), so no hero rides it: the cage is the only way up */
  stone(139, 25, 's2'); decor.push({ kind: 'flue', x: 142, y0: 16, y1: 25 });                                /* the reel's stone and the chimney */
  sign(137, 25, 'THE KITE HAULS THE CAGE WHILE THE CHIMNEY IS HOT.'); sign(146, 25, 'A CLOUD BRINGS THE CAGE DOWN TO THE DECK. STEP ON IT THERE.');
  set(149, 26, T.AIR); set(150, 26, T.AIR);                                     /* the cage's berth in the deck */
  const reel = { stone: 's2', x: 142.5 * TS + 8, top: 16 * TS, kiteY: 4 * TS, cage: 'reel' };
  cloudBank(135, 160, 5, 12, 12, 4);                                            /* a slow bank over the chimney */
  foe('kite', 138, 14, 'reelKitesA'); foe('kite', 146, 10, 'reelKitesB');         /* two goblin kites ride the reel's hot air: they drop stones on the cage */
  rock(151, 190, 14); plank(152, 161, 10); rock(166, 168, 12); rock(176, 179, 12); air(151, 189, 18, 21); ent('coin', 160, 21); ent('coin', 170, 21); ent('coin', 180, 21);                  /* THE UPPER DECK, twelve rows up the cliff: the kite loft's boards over it, a block of the old winch */
  foe('archer', 158, 13, 'deckTop', { face: -1 }); foe('shield', 155, 13, 'deckTop', { face: -1 });   /* at the cage's top */
  ent('check', 181, 13);                                                        /* CHECKPOINT TWO: the upper deck */
  cloth(188, 13);

  // ================= 3. THE HARPY ROOSTS (190-298): the chain under a rolling cloud bank =================
  sign(186, 13, 'THE ROOSTS. A CLOUD KILLS THE AIR: WAIT FOR IT TO PASS, THEN GLIDE.');
  rock(201, 204, 20);                                                           /* ROOST ONE (ten columns out: the glide) */
  plank(203, 213, 46); plank(214, 224, 44);                                     /* THE NESTING SHELVES low on the roost pillars: a fall that lands here rides R1 or R2 back up */
  pinnacle(210, 13);                                                            /* R1 */
  rock(216, 219, 18); stone(218, 17, 's3'); sign(216, 17, 'A SUN-STONE. STRIKE IT TO WAKE THE AIR OVER THE SPIRE.');   /* ROOST TWO, its stone (the lock) and its sign (FIX PASS) */
  pinnacle(226, 10, 'stone:s3');                                                /* R2: dead until roost two's stone is turned */
  plank(228, 232, 10); foe('rockgoblin', 231, 9, 'kitePlatform', { face: -1, cnSkin: 'gobslinger' }); cloth(228, 9);   /* a hanging kite platform: a slinger, and a cloth */
  decor.push({ kind: 'kiteplat', x: 229, y: 10 });
  rock(220, 222, 30); ent('silver', 221, 29); decor.push({ kind: 'nest', x: 221, y: 29 });   /* the low roost under roost two: a nest, SILVER TWO (a dead end; R2 takes you back up) */
  airOnly.push({ x0: 220, x1: 222, row: 29, vent: 226 }, { x0: 223, x1: 224, row: 43, vent: 226 });   /* (claude/skyroad2) the low roost and the shelf's end under it: R2's air is their only way out */
  rock(234, 237, 13);                                                           /* THE SPIRE: rock to the cloud sea - no glide from roost two goes under it; only R2's air carries you over (roost two's stone is a lock) */
  pinnacle(242, 14);                                                            /* R3 */
  rock(248, 251, 19); foe('horn', 250, 18, 'roostHorn', { face: -1 });          /* ROOST FOUR: the hornblower who calls the riders */
  pinnacle(258, 13);                                                            /* R4 */
  cloudBank(205, 262, 6, 12, 22, 0);                                            /* the bank rolls east over the chain, one thermal after another */
  foe('harpy', 212, 6, 'roostHarpyA'); foe('harpy', 254, 7, 'roostHarpyB');
  foe('kiterider', 226, 8, 'riders', { home: 226 }); foe('kiterider', 258, 8, 'riders', { home: 258 });
  foe('crow', 262, 14, 'crowsA', { ph: 0 }); foe('crow', 267, 15, 'crowsB', { ph: 1.3 }); foe('crow', 272, 13, 'crowsC', { ph: 2.1 });   /* A STRING OF CRAG CROWS (the moor's): they come west over R3 and R4, and a crow's shadow on a thermal kills it for a beat */
  rock(265, 298, 18); plank(268, 280, 14); rock(285, 288, 16); rock(291, 292, 16);                  /* THE FAR CLIFF, the riders' racks over it, a fallen block */
  foe('rockgoblin', 268, 17, 'cliffSling', { face: -1, cnSkin: 'gobslinger' }); foe('shield', 283, 17, 'cliffSling', { face: -1 });   /* (FIX PASS: a heavy past the roosts) */
  ent('check', 278, 17);                                                        /* CHECKPOINT THREE */

  // ================= 4. THE BROKEN SKY BRIDGE (298-388): THE SUN-DISC, then THE EXAM =================
  ent('sundisc', 295, 17, { id: 'disc' }); decor.push({ kind: 'bridgehead', x: 293, y: 17 });
  sign(281, 17, 'THE SUN-DISC. STRIKE IT TO THE SUN, THEN CROSS WHILE THE AIR RISES.');
  pinnacle(303, 15, 'disc:disc', { order: 0 }); pinnacle(310, 14, 'disc:disc', { order: 1 }); pinnacle(317, 13, 'disc:disc', { order: 2 }); pinnacle(324, 12, 'disc:disc', { order: 3 });
  cloudBank(300, 330, 5, 14, 14, 10);
  foe('kiterider', 314, 6, 'discRidersA', { home: 317 }); foe('kiterider', 326, 5, 'discRidersB', { home: 324 });
  rock(333, 347, 16); sign(346, 15, 'THE SPANS ARE CRACKED. STRIKE EACH STONE BEFORE ITS SPAN GOES.');   /* THE EAST TOWER, its broken parapet; the sign for the spans' stones s4 and s6 (FIX PASS) */
  foe('horn', 334, 15, 'towerHorn', { face: -1 });
  /* THE CRAG TROLL (claude/elitegates, Daniel 10-07): the Sky Road's GATEKEEPER ELITE. He holds the east tower - the first footing past the disc road - and the portcullis at 343 comes down over its east mouth until he is dead. The disc's air lapses behind you (16 s), the cloud sea is under the west edge, and his slam and rockfall are told: fight him on the stone, not in the air. The tower's lookout plank is gone (a jump over the gate) and the shield and bow that stood here made way for him (difficulty v2: one weighty foe). */
  foe('troll', 337, 15, 'towerTroll', { face: -1, elite: true, gate: 343 }); ent('check', 345, 15);   /* ...and the checkpoint is past his gate: his fight is the exam, the spans are the next section */
  /* THE EXAM: the broken spans - cracked stone that goes three beats after you land - between thermals you wake and thermals the clouds take */
  crumble(349, 353, 20); stone(352, 19, 's4');                                  /* SPAN A, and a stone ON it: turn it before the span goes */
  pinnacle(357, 13, 'stone:s4');                                                /* R5 */
  crumble(363, 366, 17); stone(364, 16, 's6'); cloth(366, 16);                 /* SPAN B, its stone (R6's) and KITE CLOTH FOUR */
  pinnacle(371, 11, 'stone:s6');                                                /* R6: dead until span B's stone is turned (so R5 - span A's stone - is the only way onto span B) */
  cloudBank(355, 380, 6, 11, 18, 3);
  foe('harpy', 356, 8, 'spanHarpyA'); foe('harpy', 374, 6, 'spanHarpyB');
  /* THE RIDERS' LOFT (the vault): a broken piece of the bridge's tower over span B, off R6's top - four cloths open its woven door: a silver */
  block(359, 365, 5, 11); air(360, 364, 6, 10); plank(366, 369, 11);
  for (let y = 6; y <= 10; y++) set(365, y, T.SOLID); vaultDoors.push({ x0: 365, x1: 365, y0: 6, y1: 10 });
  ent('loft', 367, 10); ent('silver', 361, 10); foe('goat', 368, 10, 'loftGoat', { face: -1 });
  crumble(376, 379, 17);                                                        /* SPAN C */
  rock(381, 389, FL); plank(382, 386, 15); ent('check', 383, FL - 1); sign(387, FL - 1, 'THE ROOSTS ARE HERS. THE ROC NESTS PAST THIS DOOR.');   /* (FIX PASS, B8: she is set up - the sign, her feathers on the bridge, her shadow over span C) */
  for (const [fx, fy] of [[299, 17], [339, 15], [350, 19], [377, 16], [385, 17]]) decor.push({ kind: 'feather', x: fx, y: fy });                                /* THE EYRIE DOOR, CHECKPOINT FOUR */

  // ================= 5. THE EYRIE (390-440): THE ROC =================
  const [A0, A1] = SKYROAD.arena;
  for (const cx of [388, 389, 441, 442]) for (let y = 0; y < FL - 6; y++) set(cx, y, T.SOLID);   /* the crag walls over her two doors: no flight out of her nest */
  rock(A0, A1, FL); rock(441, 446, FL);
  for (const x of [A0 + 1, A0 + 2, A1 - 2, A1 - 1]) set(x, FL - 1, T.SPIKE);   /* THE THORNY RIM: her gale walks you onto it */
  thermal(A0 + 6, FL - 1, 4, null, { arena: true }); thermal(A1 - 6, FL - 1, 4, null, { arena: true });   /* the rim thermals */
  thermal(415, FL - 1, 5, 'stone:s5', { arena: true }); stone(411, FL - 1, 's5');   /* the nest's own: a stone you turn (phase two's storm leaves only this) */
  ent('mast', 401, FL - 1); ent('mast', 418, FL - 1); ent('mast', 432, FL - 1);   /* THE IRON KITE-MASTS: lightning's in phase two */
  plank(A0 + 3, A0 + 8, 9); plank(A1 - 8, A1 - 3, 9);                           /* her old roosts over the rim thermals: a perch to plunge from */
  ent('roc', 415, FL - 1);
  const nest = [404, 426];                                                      /* the woven boards: her dive sticks in them */
  const arena = { x0: A0 * TS, x1: (A1 + 1) * TS, floor: FL * TS, trigger: (A0 + 4) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'roc', music: 'rocphoenix', tint: '#9ab8e0', tintA: 0.06,
    start: [A0 + 5, FL - 1], nest: [nest[0] * TS, (nest[1] + 1) * TS], eyrie: true };

  // ================= the road down =================
  rock(447, 452, FL + 3); rock(453, 459, FL + 6); plank(449, 456, FL); ent('gate', 456, FL + 5);

  const START = { x: 4, y: 45 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: [{ kind: 'lift', sky: 'reel', x: 149 * TS, y: 26 * TS, y0: 26 * TS, y1: 14 * TS, w: 32, h: 8, speed: 0 }],
    arena, gateAfterBoss: true,
    squadBands: [{ lo: 400, hi: 599, spots: 0, why: "THE ROC'S EYRIE: columns 400-459 are her arena - no squad stands in a boss arena (as the canal and the theatre)" }],
    skyroad: true, cloudSea: SEA * TS, clouds, crumbles, airOnly, vaultDoors, decor, reel, nest,
    skyThermals: L.ents.filter(e => e.t === 'vent' && e.thermal).map(e => ({ x0: e.x - 2, x1: e.x + 2 })),   /* the rule's places, for tools/rule-state.mjs (not named L.thermals: main.js reads that as the pyro's fire updrafts) */
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,                  /* four checkpoints (Daniel: fewer); src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    quest: { n: 4, item: 'kite', name: 'KITE CLOTHS', done: "FOUR CLOTHS: TAKE THEM TO THE RIDERS' LOFT", thanks: "THE RIDERS' LOFT OPENS" },
    unlocks: [
      { kind: 'stray', opens: "THE RIDERS' LOFT (a silver) once all four kite cloths are brought to it", hud: "KITE CLOTHS n/4 (the quest counter); at the loft: THE LOFT WANTS FOUR CLOTHS" },
      { kind: 'sunstone', opens: 'its thermal (dead until the stone is struck round to the sun)', hud: 'THE STONE TURNS TO THE SUN: THE AIR RISES' },
      { kind: 'sundisc', opens: 'the road of thermals over the chasm, for a time', hud: 'THE DISC TURNS: THE ROAD OF AIR RISES' },
      { kind: 'cloak', opens: 'the glide (hold jump as you fall) - the way over every chasm', hud: "THE RIDER'S CLOAK: HOLD JUMP TO GLIDE" },
      { kind: 'loft', opens: "THE RIDERS' LOFT (a silver)", hud: "THE RIDERS' LOFT OPENS" },
    ],
    music: 'skyroad',   /* "Bring Me The Sky" by Scott Buckley, CC-BY 4.0 (audio/CREDITS.txt) */
    ambient: [{ x0: 0, x1: 99999, kind: 'highair' }],   /* (claude/skyroadart) its own bed: wind whistling through rock, cloth cracking, a far raptor (src/audio.js) */
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }],
    palette: { sky: [[132, 168, 214], [236, 226, 204]], far: 'crag', mid: 'crag', near: 'none', dress: 'crag', noNear: true, haze: 'rgba(230,236,244,0.16)', grass: '#8a8a4a', grassL: '#b0a860', grassD: '#5a5a32', dirt: '#8a6a4a', dirtL: '#a8845a', dirtD: '#5a4232', canopy: ['#6a7a8a', '#8a9aaa', '#aab8c8', '#d8e0e8'] },
    duskStart: -1, duskLen: 1, night: false, glowNight: false,
    reachExact: false,
  };
}
