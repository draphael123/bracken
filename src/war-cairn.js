// src/war-cairn.js - THE WAR CAIRN (claude/warcairn, the OPUS GREYBOX of the level and its hero-boss, 2026-10-29). Brief scratch/brief-crownpath-1028.md (Daniel approved
// 10-28 with all five recs: it SUPERSEDES scratch/brief-warcairn-1015.md - a TOLD spur off HIGHCROWN, no horn shards; THE BERSERKER CHIEFTAIN at its end; beat him, THEN buy
// the Berserker for 10 silver; the spur opens when Highcrown opens). An OPTIONAL climb: nothing on the main road needs it.
// This file is the level the game runs, laid by hand (nothing sprinkled); src/war-cairn-hands.js is its rule (THE WAR DRUM: the beat, the stumble, war-rage, the clan's surge,
// the drum gates, the chained slabs, the snow cornices) and its one new foe (THE DRUMMER); THE BERSERKER CHIEFTAIN is src/bzchief.js (the fight) + src/bzchief-hands.js.
//
// THE RULE (L.rule): THE CLAN FIGHTS TO ITS DRUMS. STRIKE A DRUM AND THE BEAT IS YOURS.
//   A WAR DRUM (L.wcDrums): hide on a stone-and-antler frame. ANY blow that lands on it (a blade, an arrow, a thrown axe) is a BEAT:
//     a) every clansman in earshot (WC.beat.r tiles, the red ring) STUMBLES - his surge and his guard broken;
//     b) the striker takes WAR-RAGE for WC.rage.t s: x1.25 dealt, no flinch, x1.25 taken (the Berserker's frenzy in miniature, taught to every hero);
//     c) THE BEAT MOVES THINGS: the drum's GATES swing open (L.wcGates: T.PORT cells, open WC.gate.open s), its SLABS swing level (L.wcSlabs: one-way footing for
//        WC.slab.level s) and its CORNICES of old snow shake loose (L.wcCornices: told by a crack, gone WC.cornice.gone s, then they settle back).
//   Then the drum is SPENT for WC.beat.spent s (the hide slackens, then tightens with a glow).
//   THE DRUMMER (the one new foe, e.t 'drummer') runs between drums and beats them on a told two-count: on HIS beat the clan in earshot SURGES (faster, no flinch).
//   Strike his drum first and the beat is yours; cut him down and that stretch is quiet.
//
// FIVE NAMED AREAS (Rootway recipe: TEACH -> TEST -> REMIX -> EXAM). Columns; rows: smaller is higher. Start + TWO shrines (Daniel: fewer).
//      0-110  THE GULLY ROAD     the reused crag climb (Highcrown's cut ROAD UP, re-laid here, src/level.js untouched): five switchback terraces, the shoulder and
//                                its eyrie and watchtower, the gorge with its cascade and the rope-and-slate bridge - the far bank is gained off a DRIVEN HATCHET
//                                (the hatchet-throwers' misses stand in rock as footholds too). TEACH: the first drum and its gate (no foe on the beat)
//    110-230  THE DRUM GATES     SET PIECE A, THE GATE RUN: one beat opens the three hatches of the slab chimney - climb before they swing shut, the axemen below
//                                stumbling. REMIX: a DRUMMER on the next ledge (his beat surges the axemen, and drops the cornice over the pit). EXAM at the chimney
//                                head: two axemen and a runner round one drum. SHRINE ONE
//    230-340  THE TOTEM FACE     SET PIECE B, THE ECHO FACE: chained slabs swing level beat by beat; the high drum on the cairn-stack (a hatchet foothold up to it)
//                                is the shortcut over two slabs; the snow cornices drop on a beat. TEACHES TAKE IT: the crossed-axe guards
//    340-386  THE CLAN RING      SET PIECE C, THE EXAM: a walled ring - the clan champion, a drummer, two axemen, two drums. SHRINE TWO past it, at the stair's foot
//    386-452  THE SUMMIT         a short stair with the great cairn ahead, then THE WAR CAIRN RING: the Berserker Chieftain's arena (src/bzchief.js BZC_STAGE)
import { BZC_STAGE } from './bzchief.js';

export const CAIRN = { W: 452, H: 100 };
export const WC_RULE = 'THE CLAN FIGHTS TO ITS DRUMS. STRIKE A DRUM AND THE BEAT IS YOURS.';
export const SECTIONS = [['THE GULLY ROAD', 0, 110], ['THE DRUM GATES', 110, 230], ['THE TOTEM FACE', 230, 340], ['THE CLAN RING', 340, 386], ['THE SUMMIT', 386, 452]];
/* the rule's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/warcairn.mjs */
export const ARCS = {
  drum: { teach: [80, 96], test: [118, 140], remix: [148, 172], exam: [196, 214] },
  gate: { teach: [90, 96], test: [128, 137] },
  slab: { teach: [236, 247], test: [266, 277], remix: [284, 304], exam: [308, 330] },
  cornice: { teach: [166, 172], test: [287, 292], exam: [332, 336] },
  hatchet: { teach: [76, 79], develop: [282, 285] },
  guard: { teach: [250, 256], test: [280, 284], exam: [318, 322] },
};
/* the clan's skins (src/main.js L.reskin): every clansman is a reskin of a proven foe - THE CLAN IS HUMAN (no goblin anywhere in it) */
export const WC_RESKIN = { soldier: 'clanaxe', javelin: 'clanthrower', shield: 'clanguard', heavy: 'clanchamp', berserker: 'clanrunner', harpy: 'cragharpy' };
export const WC_SAY_SIGNS = {
  lore: 'THE GOBLINS TOOK THE CASTLE, NEVER THE PEAK. A MOUNTAIN CLAN KEEPS ITS WAR CAIRN UP THERE, AND ITS CHIEFTAIN FIGHTS ANYONE WHO CLIMBS TO IT.',
};

export function buildWarCairn({ painter, T, TS }) {
  const { W, H } = CAIRN, BOT = H - 1;
  const L = painter(W, H), { set, block, ent } = L;
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR);
  const rock = (x0, x1, top) => block(x0, x1, top, BOT);                 /* the mountain: every ledge is the rock itself, down to the bottom of the world */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const deco = (x, y, kind, v) => ent('deco', x, y, { kind, v: v || 0 });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ squad, face: -1 }, o || {}));
  const drums = [], gates = [], slabs = [], cornices = [], holds = [], reachDoors = [], reachSpans = [], hoists = [];
  /* A WAR DRUM at column x on feet row f (it stands on row f+1). r: its earshot in tiles. What its beat works: gates, slabs, cornices (ids) */
  const drum = (id, x, f, o) => { const d = Object.assign({ id, x, f, gates: [], slabs: [], cornices: [] }, o || {}); drums.push(d); ent('wcdrum', x, f, { id });
    hoists.push({ id, load: 'beat', cleat: [x, f], x, drum: id, ...(d.arena ? { boss: true } : {}) }); return d; };
  /* A DRUM GATE: hide on a bone frame, hung on stone posts - T.PORT cells (x0..x1, y0..y1) until the beat swings it open */
  const gate = (dr, id, x0, x1, y0, y1) => { const g = { id, drum: dr.id, x0, x1, y0, y1 }; gates.push(g); dr.gates.push(id); fill(x0, x1, y0, y1, T.PORT); ent('wcgate', x0, y1, { id });
    reachDoors.push({ x0, x1, y0, y1 }); return g; };
  /* A CHAINED SLATE SLAB: hangs on its chains (no footing) until a beat swings it level (one-way footing) - row y, columns x0..x1 */
  const slab = (dr, id, x0, x1, y) => { const s = { id, drum: dr.id, x0, x1, y }; slabs.push(s); dr.slabs.push(id); ent('wcslab', x0, y, { id, x1 }); reachSpans.push([x0, x1, y]); return s; };
  /* A CORNICE of old wind-crusted snow: one-way footing that a beat shakes loose (told: a crack and a puff), gone a while, then it settles back */
  const cornice = (dr, id, x0, x1, y) => { const c = { id, drum: dr.id, x0, x1, y }; cornices.push(c); dr.cornices.push(id); fill(x0, x1, y, y, T.ONEWAY); ent('wccornice', x0, y, { id, x1 }); return c; };
  /* A DRIVEN HATCHET: an old clan hatchet standing out of the rock face - a one-tile foothold (the face it is driven into is at x + dir) */
  const hold = (x, y, dir) => { set(x, y, T.ONEWAY); holds.push({ x, y, dir }); ent('wchold', x, y, { dir }); };
  /* A SLATE SPAN ON CARVED POSTS (the second heights): one-way slate laid across stone posts that stand on the floor below - the walkway runs between the posts (drawn, not
     solid). L.structures carries each for the art lane and anchor-lint ('cairnArch'); src/war-cairn-hands.js draws the greybox posts */
  const structures = [];
  const span = (x0, x1, y, floor) => { fill(x0, x1, y, y, T.ONEWAY); structures.push({ x0, x1, top: y, floor, kind: 'cairnArch' }); };

  // ================= 1. THE GULLY ROAD (0-110): TEACH - the reused crag climb =================
  /* THE GULLY: a rock wall on the left, the mountain on the right, five terraces between that the road zig-zags up - each shelf THREE rows of rock (natural crag over
     the terrace under it), a pair of rock steps up at the open end. Re-laid from Highcrown's cut ROAD UP (src/level.js highcrownWhole, cols 0-40) with thicker shelves */
  rock(0, 40, 96);                                         /* T1, the gully floor (feet 95) */
  block(0, 2, 58, 95);                                     /* the gully's west wall */
  rock(41, 64, 69);                                        /* the mountain (its shoulder is the top, row 69) */
  block(3, 8, 94, 95); block(3, 5, 92, 93); block(3, 4, 90, 91);   /* T1 -> T2, on the left (rock steps, two rows each) */
  block(8, 40, 89, 91);                                    /* T2, off the mountain (two clear columns at its west end: the jump up off T1 has its headroom) */
  block(38, 40, 87, 88); block(39, 40, 85, 86); block(40, 40, 83, 84);   /* T2 -> T3, on the right */
  block(3, 36, 82, 84);                                    /* T3, off the wall */
  block(3, 6, 80, 81); block(3, 4, 78, 79);               /* T3 -> T4, on the left */
  block(7, 40, 76, 78);                                    /* T4, off the mountain */
  block(36, 40, 74, 75); block(38, 40, 72, 73); block(40, 40, 70, 71);   /* T4 -> the shoulder, on the right */
  block(3, 36, 68, 70);                                    /* T5: a spur back over the gully (a cairn of the clan's dead, and a silver) */
  ent('sign', 14, 95, { text: WC_SAY_SIGNS.lore });
  sign(20, 95, WC_RULE);
  foe('goat', 30, 88, 'gully', { face: -1 }); foe('soldier', 20, 81, 'gully', { face: 1 }); foe('goat', 26, 75, 'gully', { face: -1 });
  deco(23, 95, 'cairn'); deco(12, 81, 'stone', 1); deco(20, 88, 'bones'); deco(30, 75, 'cairn', 1); deco(10, 67, 'cairn', 2);
  ent('silver', 5, 67);                                    /* SILVER ONE: the spur's end, over the gully */
  coins([6, 93], [4, 91], [4, 89], [38, 86], [39, 84], [40, 82], [5, 79], [4, 77], [37, 73], [39, 71], [14, 67], [18, 67], [22, 67]);
  /* THE SHOULDER: an eyrie on the rocks (two crag harpies - the Rookery keeps the rest), a stone watchtower with a rope ladder up its face (a silver on top) */
  deco(46, 68, 'eyrie'); foe('harpy', 47, 58, 'eyrie'); foe('harpy', 58, 56, 'eyrie');
  block(51, 55, 58, 68); for (const x of [51, 53, 55]) set(x, 57, T.SOLID); fill(50, 50, 58, 68, T.NET);
  ent('silver', 54, 57);                                   /* SILVER TWO: the watchtower's top */
  coins([44, 68], [48, 68], [60, 68]);
  /* THE GORGE: a fall of water down its near side, and the rope-and-slate bridge (slate treads lashed on two ropes, both ends on the rock). The far bank stands six rows
     higher than the bridge: ONE DRIVEN HATCHET in its face is the step up (the clan's - and a hatchet-thrower's miss stands in rock the same way, a while) */
  for (let x = 65; x <= 80; x++) set(x, 69, T.PLANK);
  ent('cascade', 64, 70, { y1: BOT }); deco(64, 68, 'bridgepost'); foe('harpy', 72, 60, 'gorge');
  rock(81, 92, 63);                                        /* the far bank (feet 62); its lip, cols 79-80, is old snow (the cornice, below) */
  hold(80, 66, 1);                                         /* THE HATCHET IN THE FACE: the bridge's feet 68 -> it (65) -> the bank (62) */
  sign(76, 68, 'A HATCHET STANDS IN THE ROCK. STAND ON IT.');
  foe('javelin', 89, 62, 'farBank', { face: -1 });         /* THE HATCHET-THROWER: his misses stick in the rock (a while) - a foothold too */
  /* THE FIRST DRUM (TEACH, safe: nothing on the beat): its gate is the cairn wall's tunnel mouth. The wall is twenty rows high - only the beat opens the way */
  const d1 = drum('gully', 83, 62);
  cornice(d1, 'lip', 79, 80, 63);                          /* THE CORNICE TAUGHT: the bank's lip of old snow - the first beat shakes it loose behind you (a fall onto the bridge, never the gorge) */
  span(84, 91, 60, 63);                                    /* a slate span on posts over the far bank (a second height: coins) */
  coins([86, 59], [89, 59]);
  span(43, 49, 66, 69);                                    /* the eyrie's slate perch on the shoulder */
  coins([45, 65], [47, 65]);
  block(93, 98, 40, 62); rock(93, 100, 63); air(93, 98, 60, 62);   /* THE CAIRN WALL, and the tunnel through it (floor row 63) */
  gate(d1, 'tunnel', 97, 98, 60, 62);   /* (at the tunnel's FAR mouth: hung on the wall's stone, the hide swings outward) */
  sign(81, 62, 'A WAR DRUM. STRIKE IT: THE BEAT SWINGS THE DRUM GATE OPEN. THEN GO.');
  coins([85, 62], [87, 62], [96, 62], [98, 62]);
  /* THE BROKEN PIERS: three stone stacks up to the gate run's ground, each on its own column of rock (a fall is the gorge's) */
  rock(102, 104, 61); rock(106, 108, 59);
  coins([103, 60], [107, 58]);

  // ================= 2. THE DRUM GATES (110-230): SET PIECE A, THE GATE RUN =================
  rock(110, 140, 58);                                      /* the gate run's ground (feet 57) */
  const d2 = drum('gaterun', 121, 57);
  foe('soldier', 114, 57, 'gateFoot', { face: 1 }); foe('soldier', 118, 57, 'gateFoot', { face: 1 });
  block(122, 123, 55, 57); hold(124, 53, 1);               /* a step and a DRIVEN HATCHET in the chimney's face: up to the slate span (coins) */
  span(118, 123, 50, 58); coins([119, 49], [121, 49]); ent('silver', 123, 49);   /* SILVER THREE: on the span the chimney's hatchet leads up to */
  sign(111, 57, 'ONE BEAT OPENS ALL THREE HATCHES OF THE CHIMNEY. CLIMB BEFORE THEY SWING SHUT.');
  /* THE SLAB CHIMNEY: interior cols 128-137, three floors three rows apart; each floor a slate stub on one side and a HIDE HATCH (T.PORT) on the other - hatches
     alternate sides, so the climb is up through each. The roof of the chimney and its walls are the rock; the way out is east at the top */
  block(125, 140, 30, 57); air(128, 137, 46, 57); air(125, 127, 56, 57); air(138, 140, 46, 48);
  fill(132, 137, 55, 55, T.SOLID); gate(d2, 'hatch1', 128, 131, 55, 55);   /* (each hatch hangs right beside the stub you land on above it: up through it, a step aside) */
  fill(128, 131, 52, 52, T.SOLID); fill(136, 137, 52, 52, T.SOLID); gate(d2, 'hatch2', 132, 135, 52, 52);
  fill(132, 137, 49, 49, T.SOLID); gate(d2, 'hatch3', 128, 131, 49, 49);
  coins([136, 54], [129, 51], [136, 48]);
  /* REMIX: THE DRUMMER'S LEDGE (feet 48). His drum surges the axemen; his beat also shakes the CORNICE over the pit loose */
  rock(141, 166, 49); rock(172, 176, 49);
  const d3 = drum('drummer1', 150, 48);
  span(144, 157, 46, 49);                                  /* the drummer's ledge has a slate span over it: up out of the axemen's reach */
  coins([146, 45], [155, 45]);
  foe('drummer', 153, 48, 'drumLedge', { drum: 'drummer1', drums: ['drummer1', 'exam'] });
  foe('soldier', 158, 48, 'drumLedge'); foe('soldier', 163, 48, 'drumLedge');
  cornice(d3, 'pit', 167, 171, 49);                        /* THE CORNICE OVER THE PIT: footing until a beat shakes it loose */
  sign(143, 48, 'HIS DRUM, HIS BEAT: THE CLAN SURGES. STRIKE IT FIRST, OR CUT HIM DOWN.');
  coins([145, 48], [160, 48], [174, 48]);
  /* up to the exam yard */
  rock(177, 180, 46); rock(181, 184, 43);
  /* EXAM at the chimney head: two axemen and a runner round one drum */
  rock(185, 238, 40);
  const d4 = drum('exam', 205, 39);
  span(189, 198, 36, 40); span(202, 212, 36, 40); block(196, 197, 38, 39); block(208, 209, 38, 39);   /* two slate spans on posts over the yard, a rock step under each */
  coins([191, 35], [210, 35]);
  foe('soldier', 193, 39, 'examYard'); foe('soldier', 215, 39, 'examYard'); foe('berserker', 222, 39, 'examYard', { awake: false });
  block(199, 201, 37, 39);                                 /* a cairn in the yard (a second height) */
  deco(200, 36, 'cairn'); coins([188, 39], [200, 36], [217, 39]);
  ent('check', 229, 39);                                   /* SHRINE ONE: the gate run behind you */

  // ================= 3. THE TOTEM FACE (230-340): SET PIECE B, THE ECHO FACE =================
  const d5 = drum('face1', 236, 39);
  slab(d5, 'face1a', 239, 246, 40);                        /* TEACH: one slab over the drop */
  sign(232, 39, 'THE BEAT SWINGS THE CHAINED SLABS LEVEL. THEY HOLD A FEW SECONDS.');
  rock(247, 256, 40); span(248, 255, 36, 40);              /* a span off the cairn-stack step */
  foe('shield', 252, 39, 'faceGuard1');                    /* THE CROSSED-AXE GUARD: his axes turn a blow from the front - a heavy blow, or a beat, breaks it */
  sign(248, 39, 'CROSSED AXES TURN A BLOW. A HEAVY BLOW OR A DRUM BEAT BREAKS THE GUARD.');
  rock(257, 260, 37); rock(261, 268, 34);
  const d6 = drum('face2', 266, 33);
  slab(d6, 'face2a', 269, 276, 34);                        /* THE LOW LINE: a slab, a guard, the cornice */
  rock(277, 283, 34);
  foe('shield', 280, 33, 'faceGuard2');
  rock(284, 286, 28);                                      /* THE CAIRN-STACK: the high drum stands on it */
  hold(283, 31, 1);                                        /* ...up its face off a driven hatchet */
  cornice(d6, 'face', 287, 292, 34);                       /* the low line's cornice (the beat that swung the slab shakes it loose: wait for the snow) */
  rock(293, 300, 34); rock(301, 303, 31); span(294, 299, 30, 34);
  const d7 = drum('high', 285, 27);
  slab(d7, 'high1', 287, 295, 28); slab(d7, 'high2', 296, 303, 28);   /* THE HIGH LINE: two slabs under the high drum - the shortcut */
  coins([286, 27]);
  coins([290, 33], [297, 33], [299, 27], [302, 30]);
  sign(262, 33, 'THE LOW LINE IS SAFE. THE HIGH DRUM ON THE CAIRN-STACK SWINGS TWO SLABS: THE SHORT WAY.');
  rock(304, 310, 28);
  const d8 = drum('face3', 309, 27);
  slab(d8, 'face3a', 311, 317, 28);
  rock(318, 322, 28);
  const d9 = drum('face4', 321, 27);
  foe('shield', 319, 27, 'faceGuard3');
  slab(d9, 'face4a', 323, 329, 28);
  rock(330, 331, 28);
  cornice(d9, 'ledge', 332, 336, 28);
  rock(337, 340, 28);
  deco(306, 27, 'totem'); deco(338, 27, 'totem', 1); coins([314, 27], [326, 27], [334, 27]);

  // ================= 4. THE CLAN RING (340-386): SET PIECE C, THE EXAM =================
  rock(341, 391, 28);                                      /* the ring's floor (feet 27) */
  block(341, 342, 25, 27); block(383, 384, 25, 27);        /* its low stone wall (three rows: over it with a jump) */
  block(355, 358, 25, 27); block(368, 371, 25, 27);        /* two tiers of seats */
  span(343, 354, 23, 28); span(359, 367, 23, 28); span(372, 382, 23, 28);   /* the rim's slate walk on its posts: the clan watches from up here */
  const d10 = drum('ring1', 348, 27), d11 = drum('ring2', 378, 27);
  foe('drummer', 351, 27, 'ring', { drum: 'ring1', drums: ['ring1', 'ring2'] });
  foe('heavy', 363, 27, 'ring', { elite: true });           /* THE CLAN CHAMPION: crossed axes (his guard) and the flurry */
  foe('soldier', 374, 27, 'ring'); foe('soldier', 356, 24, 'ring');
  sign(344, 27, 'THE CLAN RING. TAKE THEIR DRUMS AND THE CHAMPION STUMBLES WITH THE REST.');
  deco(357, 24, 'bones'); coins([350, 27], [366, 27], [370, 24], [380, 27]);
  ent('check', 389, 27);                                   /* SHRINE TWO: the boss's retry point, at the stair's foot */

  // ================= 5. THE SUMMIT (386-452) =================
  rock(392, 395, 25); rock(396, 399, 22);
  sign(391, 27, 'THE WAR CAIRN. THE CHIEFTAIN FIGHTS TO THE CLAN\'S DRUMS: STRIKE ONE IN HIS FRENZY AND HE LOSES THE BEAT.');
  coins([393, 24], [397, 21]);
  const st = BZC_STAGE, sx = st.sx, R = st.floor;
  rock(400, W - 1, R);                                     /* the ring's slabs */
  block(sx - 1, W - 1, 0, R - st.roof - 1);               /* the sky over it is the peak's overhang (the camera's roof) */
  block(sx + st.W, W - 1, 0, R - 1);                       /* the east wall: the great cairn's foot */
  const arenaDrums = st.drums.map((c, i) => { const d = drum('arena' + i, sx + c, R - 1, { arena: true }); return d; });
  ent('bzchief', sx + st.him, R - 1, { face: -1 });
  deco(sx + st.W - 4, R - 1, 'cairn', 3);
  const arena = { x0: sx * TS, x1: (sx + st.W) * TS, floor: R * TS, y0: (R - st.roof) * TS, trigger: (sx + 3) * TS, wallL: sx - 1, wallR: sx + st.W, boss: 'bzchief', music: 'boss3',
    tint: '#e8d0c0', tintA: 0.04, start: [sx + 2, R - 1], bzc: { sx, R } };

  const ents = L.ents;
  return {
    W, H, grid: L.grid, ents, START: { x: 11, y: 95 }, pools: [], falls: [],
    arena, warcairn: true, rule: WC_RULE,
    wcDrums: drums, wcGates: gates, wcSlabs: slabs, wcCornices: cornices, wcHolds: holds, hoists, reachDoors, reachSpans, structures,
    reskin: WC_RESKIN, foeHit: {},
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 260,                  /* start + two shrines (Daniel: fewer): src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: sx - 2, hi: W - 1, spots: 0, why: 'THE WAR CAIRN RING: the boss\'s arena - no squad stands in it' }],
    unlocks: [
      { kind: 'hoists', opens: 'a gate (the drum gates and the chimney hatches), a bridge (the chained slabs swing level)', hud: 'THE BEAT IS YOURS' },
      { kind: 'wcdrum', opens: 'gate', hud: 'THE DRUM GATE SWINGS OPEN' },
    ],
    duskStart: -1, duskLen: 1, music: 'mountain', night: false, glowNight: false,
    palette: { sky: 'day', dress: 'none', ledges: 'rock', haze: 'rgba(200,215,235,0.10)', dirt: '#6e6a66', dirtL: '#8e8a84', dirtD: '#4a4744', grass: '#7a8a6a', grassL: '#9aa88a', grassD: '#56604a' },
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    tints: [[-24, W + 24, [215, 225, 240], 0.05]],
    reachExact: false,
  };
}
